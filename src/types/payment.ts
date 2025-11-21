// Virtual POS ve ödeme ile ilgili tip tanımlamaları

/**
 * Sanal POS Sağlayıcıları
 * Sistem henüz seçilmediği için flexibilite sağlanmıştır
 */
export enum PaymentProvider {
  PAYTR = "paytr", // PayTR
  IYZIPAY = "iyzipay", // iyzipay
  PARAM = "param", // Param
  NESTPAY = "nestpay", // NestPay
  ASSECO = "asseco", // Asseco
  // Ek POS sağlayıcılar burada eklenebilir
}

/**
 * Ödeme Yöntemi
 */
export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  WHATSAPP = "whatsapp", // Mevcut - WhatsApp üzerinden sipariş
  INSTALLMENT = "installment", // Taksit
  WALLET = "wallet", // Dijital cüzdan
  BANK_TRANSFER = "bank_transfer", // Banka transferi
}

/**
 * Ödeme Durumu
 */
export enum PaymentStatus {
  PENDING = "pending", // Beklemede
  PROCESSING = "processing", // İşlemde
  COMPLETED = "completed", // Tamamlandı
  FAILED = "failed", // Başarısız
  CANCELLED = "cancelled", // İptal edildi
  REFUNDED = "refunded", // İade edildi
  WAITING_CONFIRMATION = "waiting_confirmation", // Onayla bekleniyor
}

/**
 * Kredi Kartı Türü
 */
export enum CardType {
  VISA = "visa",
  MASTERCARD = "mastercard",
  AMEX = "amex",
  TROY = "troy",
  UNKNOWN = "unknown",
}

/**
 * Ödeme İşlemi Bilgileri
 */
export interface PaymentTransaction {
  id: string;
  order_id: number;
  user_id: string;

  // Ödeme Bilgileri
  payment_method: PaymentMethod;
  payment_provider: PaymentProvider;
  amount: number;
  currency: string; // 'TRY', 'EUR', 'USD' vs.

  // Kart Bilgileri (Maskelenmiş)
  card_last_four?: string;
  card_type?: CardType;
  card_holder_name?: string;

  // İşlem Durumu
  status: PaymentStatus;

  // İşlem Detayları
  transaction_reference?: string; // POS'tan gelen referans
  payment_gateway_reference?: string; // Ödeme geçidi referansı
  error_message?: string;
  error_code?: string;

  // İnstallment Bilgileri
  installment_count?: number;
  installment_amount?: number;

  // Zaman Bilgileri
  created_at: string;
  updated_at: string;
  completed_at?: string;

  // Ek Veriler
  metadata?: Record<string, unknown>;
}

/**
 * Kredi Kartı Bilgileri (Form Girdisi)
 */
export interface CardData {
  card_number: string;
  card_holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

/**
 * Ödeme İsteği
 */
export interface PaymentRequest {
  order_id: number;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_provider: PaymentProvider;

  // Kart Bilgileri
  card_data?: CardData;

  // Taksit Bilgileri
  installment_count?: number;

  // Müşteri Bilgileri
  customer_email: string;
  customer_phone?: string;
  customer_name: string;

  // İpn/Webhook URL'i
  return_url?: string;
  notify_url?: string;

  // Ek Veriler
  metadata?: Record<string, unknown>;
}

/**
 * Ödeme Yanıtı
 */
export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  message: string;

  // Başarı Durumunda
  payment_url?: string; // 3D Secure veya özgün ödeme sayfası URL'i
  reference?: string;

  // Hata Durumunda
  error_code?: string;
  error_message?: string;

  // Ek Bilgi
  requires_confirmation?: boolean;
}

/**
 * Ödeme Callback/Webhook Verisi
 */
export interface PaymentWebhook {
  transaction_id: string;
  order_id: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
  reference?: string;
  error_code?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Ödeme Konfigürasyonu
 */
export interface PaymentConfig {
  provider: PaymentProvider;
  enabled: boolean;

  // Kimlik Doğrulama
  api_key?: string;
  merchant_id?: string;
  api_secret?: string;

  // Ek Ayarlar
  sandbox_mode: boolean;
  allowed_installments?: number[];
  min_amount?: number;
  max_amount?: number;

  // Callback/Webhook
  webhook_url?: string;
  return_url?: string;
}

/**
 * Taksit Seçeneği
 */
export interface InstallmentOption {
  count: number;
  label: string;
  monthly_amount: number;
  total_amount: number;
  fee_percentage?: number;
}

/**
 * Ödeme Sayfası Adımları
 */
export enum PaymentStep {
  PAYMENT_METHOD = "payment_method",
  CARD_DETAILS = "card_details",
  INSTALLMENT = "installment",
  CONFIRMATION = "confirmation",
  PROCESSING = "processing",
  RESULT = "result",
}
