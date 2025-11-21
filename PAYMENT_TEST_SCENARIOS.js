// Test dosyası - Payment API endpoints

/**
 * Test Senaryoları:
 * 1. Başarılı ödeme (test kart)
 * 2. Başarısız ödeme (geçersiz kart)
 * 3. Webhook callback işleme
 * 4. Duplikat işlem kontrolü
 * 5. Invalid signature webhook
 */

// ============================================================
// SENARYO 1: Başarılı Ödeme İşlemi
// ============================================================

const successPaymentRequest = {
  order_id: 1,
  amount: 1500.0,
  currency: "TRY",
  payment_method: "credit_card",
  payment_provider: "paytr",
  customer_email: "test@example.com",
  customer_phone: "905551234567",
  customer_name: "Test Kullanıcı",
  card_data: {
    card_number: "4111111111111111", // PayTR test kartı - BAŞARILI
    card_holder_name: "TEST USER",
    expiry_month: "12",
    expiry_year: "25",
    cvv: "123",
  },
  installment_count: 1,
  return_url: "http://localhost:3000/en/orders",
};

console.log("📝 SENARYO 1: Başarılı Ödeme");
console.log("Request Body:", JSON.stringify(successPaymentRequest, null, 2));
console.log(
  "Beklenen Sonuç: status = PROCESSING, transaction_id oluşturulmalı"
);
console.log("---\n");

// ============================================================
// SENARYO 2: Başarısız Ödeme (Geçersiz Kart)
// ============================================================

const failedPaymentRequest = {
  order_id: 2,
  amount: 2000.0,
  currency: "TRY",
  payment_method: "credit_card",
  payment_provider: "paytr",
  customer_email: "test2@example.com",
  customer_phone: "905552345678",
  customer_name: "Başarısız Test",
  card_data: {
    card_number: "5555555555554444", // PayTR test kartı - BAŞARILI (aslında)
    card_holder_name: "FAILED TEST",
    expiry_month: "01",
    expiry_year: "23", // Geçmiş tarih
    cvv: "456",
  },
  installment_count: 1,
  return_url: "http://localhost:3000/en/orders",
};

console.log("📝 SENARYO 2: Başarısız Ödeme (Geçersiz Tarih)");
console.log("Request Body:", JSON.stringify(failedPaymentRequest, null, 2));
console.log("Beklenen Sonuç: Validasyon hatası veya POS tarafından reddedilme");
console.log("---\n");

// ============================================================
// SENARYO 3: Taksit ile Ödeme
// ============================================================

const installmentPaymentRequest = {
  order_id: 3,
  amount: 3000.0,
  currency: "TRY",
  payment_method: "installment",
  payment_provider: "paytr",
  customer_email: "test3@example.com",
  customer_phone: "905553456789",
  customer_name: "Taksit Test",
  card_data: {
    card_number: "4111111111111111",
    card_holder_name: "INSTALLMENT TEST",
    expiry_month: "12",
    expiry_year: "25",
    cvv: "123",
  },
  installment_count: 6, // 6 taksit
  return_url: "http://localhost:3000/en/orders",
};

console.log("📝 SENARYO 3: Taksit ile Ödeme (6 ay)");
console.log(
  "Request Body:",
  JSON.stringify(installmentPaymentRequest, null, 2)
);
console.log("Beklenen Sonuç: 6 aylık taksitli ödeme işlemi");
console.log("---\n");

// ============================================================
// SENARYO 4: Webhook Callback - Başarılı
// ============================================================

const successWebhookPayload = {
  merchant_oid: "1",
  transaction_id: "paytr_tx_123456",
  status: "success",
  amount: 150000, // Kuruş cinsinden
  merchant_id: "YOUR_MERCHANT_ID",
  error_code: null,
  reason: null,
};

const successWebhookSignature = "xxxx_imza_xxxx"; // Webhook header'ı

console.log("📝 SENARYO 4: Webhook Callback - Başarılı");
console.log("Webhook Payload:", JSON.stringify(successWebhookPayload, null, 2));
console.log("Headers:");
console.log("  x-payment-provider: paytr");
console.log("  x-webhook-signature: " + successWebhookSignature);
console.log(
  "Beklenen Sonuç: payment_transactions tablosu UPDATE, status = COMPLETED"
);
console.log("---\n");

// ============================================================
// SENARYO 5: Webhook Callback - Başarısız
// ============================================================

const failedWebhookPayload = {
  merchant_oid: "2",
  transaction_id: "paytr_tx_789012",
  status: "failed",
  amount: 200000,
  merchant_id: "YOUR_MERCHANT_ID",
  error_code: "E0001",
  reason: "Kart reddedildi",
};

console.log("📝 SENARYO 5: Webhook Callback - Başarısız");
console.log("Webhook Payload:", JSON.stringify(failedWebhookPayload, null, 2));
console.log(
  "Beklenen Sonuç: payment_transactions tablosu UPDATE, status = FAILED, error_message set"
);
console.log("---\n");

// ============================================================
// SENARYO 6: Geçersiz İmzalı Webhook
// ============================================================

console.log("📝 SENARYO 6: Geçersiz İmzalı Webhook");
console.log("Headers:");
console.log("  x-payment-provider: paytr");
console.log("  x-webhook-signature: invalid_signature_12345");
console.log("Beklenen Sonuç: 401 Unauthorized, transaction UPDATE yapılmaz");
console.log("---\n");

// ============================================================
// SENARYO 7: Durumu Sorgulama
// ============================================================

console.log("📝 SENARYO 7: Transaction Durumunu Sorgulama");
console.log("GET /api/payment/status?transactionId=txn_123456");
console.log("Beklenen Sonuç:");
console.log({
  id: "txn_123456",
  status: "completed",
  amount: 1500.0,
  currency: "TRY",
  payment_method: "credit_card",
  completed_at: "2024-11-20T10:30:00Z",
});
console.log("---\n");

// ============================================================
// TEST KART NUMARALARı (PayTR)
// ============================================================

console.log("🏦 TEST KART NUMARALARı:");
console.log("Başarılı İşlemler:");
console.log("  • 4111 1111 1111 1111");
console.log("  • 5555 5555 5555 4444");
console.log("Başarısız İşlemler:");
console.log("  • 4000 0000 0000 0002");
console.log("  • Tarih: 01/23 (Geçmiş tarih)");
console.log("  • CVV: Herhangi 3-4 hane");
console.log("\n");

// ============================================================
// cURL ÖRNEKLERI
// ============================================================

console.log("🔧 CURL KOMUTLARI:\n");

console.log("1️⃣  Ödeme Başlatma:");
console.log(`curl -X POST http://localhost:3000/api/payment/process \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \\
  -d '${JSON.stringify(successPaymentRequest)}'
`);

console.log("\n2️⃣  Durumu Sorgulama:");
console.log(`curl -X GET "http://localhost:3000/api/payment/status?transactionId=txn_123456" \\
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
`);

console.log("\n3️⃣  Webhook Test:");
console.log(`curl -X POST http://localhost:3000/api/payment/webhook \\
  -H "Content-Type: application/json" \\
  -H "x-payment-provider: paytr" \\
  -H "x-webhook-signature: IMZA_DEGERI" \\
  -d '${JSON.stringify(successWebhookPayload)}'
`);

console.log("\n");

// ============================================================
// BROWSER CONSOLE TEST
// ============================================================

console.log("🌐 BROWSER'DA TEST ETMEK İÇİN:\n");

const browserTestCode = `
// PaymentScreen bileşenini test et
fetch('/api/payment/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: 1,
    amount: 1500,
    currency: 'TRY',
    payment_method: 'credit_card',
    card_data: {
      card_number: '4111111111111111',
      card_holder_name: 'TEST USER',
      expiry_month: '12',
      expiry_year: '25',
      cvv: '123'
    }
  })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
`;

console.log(browserTestCode);

export {
  successPaymentRequest,
  failedPaymentRequest,
  installmentPaymentRequest,
  successWebhookPayload,
  failedWebhookPayload,
};
