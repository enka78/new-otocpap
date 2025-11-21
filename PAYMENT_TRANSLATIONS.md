# Sanal POS Ödeme Sistemi - Tercüme Anahtarları

Ödeme sistemi entegrasyonu için `messages/en.json` ve `messages/tr.json` dosyalarına eklenecek tercüme anahtarları.

## Tercüme Anahtarları (JSON Format)

Aşağıdaki JSON bloğunu ilgili dil dosyalarına ekleyin:

### messages/en.json

```json
{
  "payment": {
    "title": "Payment",
    "amount": "Amount",
    "selectMethod": "Select Payment Method",
    "method": {
      "creditCard": "Credit Card",
      "creditCardDesc": "Pay with debit/credit card",
      "installment": "Installment",
      "installmentDesc": "Pay in installments (up to 12 months)",
      "bankTransfer": "Bank Transfer",
      "bankTransferDesc": "Direct bank transfer",
      "whatsapp": "Order via WhatsApp",
      "whatsappDesc": "Contact us via WhatsApp to complete your order"
    },
    "paymentMethod": "Payment Method",
    "totalAmount": "Total Amount",
    "selectInstallment": "Select Installment Plan",
    "monthlyAmount": "Monthly Amount",
    "fee": "fee",
    "card": {
      "cardNumber": "Card Number",
      "holderName": "Card Holder Name",
      "month": "Month",
      "year": "Year",
      "cvv": "CVV"
    },
    "back": "Back",
    "next": "Continue",
    "cancel": "Cancel",
    "pay": "Pay Now",
    "processing": "Processing...",
    "sending": "Sending...",
    "success": "Payment Successful",
    "successMessage": "Your payment has been processed successfully. Your order is being prepared.",
    "failed": "Payment Failed",
    "failedMessage": "Your payment could not be processed. Please try again or contact us.",
    "tryAgain": "Try Again",
    "transactionId": "Transaction ID",
    "orderWithWhatsApp": "Order via WhatsApp",
    "errors": {
      "title": "Error",
      "invalidCardNumber": "Please enter a valid 16-digit card number",
      "cardHolderRequired": "Please enter the cardholder name",
      "expiryRequired": "Please enter card expiry date",
      "invalidCvv": "Please enter a valid CVV (3-4 digits)",
      "paymentFailed": "Payment failed. Please try again.",
      "unknown": "An unexpected error occurred"
    },
    "installment": {
      "option1": "1 Installment - Immediate Payment",
      "option2": "2 Installments",
      "option3": "3 Installments",
      "option6": "6 Installments",
      "option9": "9 Installments",
      "option12": "12 Installments"
    }
  }
}
```

### messages/tr.json

```json
{
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
}
```

## Entegrasyon Adımları

1. `messages/en.json` dosyasını açın
2. Dosyanın sonundaki `}` işaretinden önce virgül ekleyin (eğer varsa)
3. Yukarıdaki İngilizce tercümeleri yapıştırın
4. Aynısını `messages/tr.json` için tekrarlayın
5. Uygulamayı yeniden başlatın

## Örnek Entegrasyon

```json
{
  "nav": {
    "home": "Ana Sayfa"
    // ... diğer nav anahtarları
  },
  "products": {
    // ... ürün anahtarları
  },
  "checkout": {
    // ... checkout anahtarları
  },
  "payment": {
    // Yeni ödeme anahtarları buraya gelir
    "title": "Ödeme"
    // ... tüm payment anahtarları
  }
}
```

## Kullanım Örneği

PaymentScreen bileşeninde:

```tsx
const t = useTranslations();

// Tercümeleri kullan
const title = t("payment.title");
const creditCardLabel = t("payment.method.creditCard");
const errorMsg = t("payment.errors.invalidCardNumber");
```

## Notlar

- Tercüme anahtarları büyük/küçük harf duyarlıdır
- Tüm anahtarlar hem `en.json` hem `tr.json`'da olmalıdır
- Yeni anahtarlar ekledikten sonra uygulamayı yeniden başlatın
- Eksik tercümeler konsol hatası gösterecektir
