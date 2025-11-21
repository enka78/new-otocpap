// Sanal POS Sağlayıcıları Konfigürasyonu
// Bu dosya henüz hangi sanal POS kullanılacağı belirlenmemiş olduğundan,
// tüm POS integrasyon arayüzleri için bir temel sağlar

import {
  PaymentRequest,
  PaymentResponse,
  PaymentWebhook,
  PaymentConfig,
} from "@/types/payment";

/**
 * Sanal POS Sağlayıcı Arayüzü
 * Tüm POS entegrasyonları bu arayüzü uygulamalıdır
 */
export interface IPosProvider {
  name: string;
  provider: string;

  /**
   * Ödeme başlatma
   */
  initializePayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Ödeme durumunu sorgulama
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;

  /**
   * İade işlemi
   */
  refundPayment(
    transactionId: string,
    amount: number
  ): Promise<PaymentResponse>;

  /**
   * Webhook imzasını doğrulama
   */
  verifyWebhookSignature(payload: unknown, signature: string): boolean;

  /**
   * Webhook verilerini işleme
   */
  parseWebhookData(payload: unknown): PaymentWebhook;
}

/**
 * Sanal POS Konfigürasyonları
 */
export const POS_CONFIGS: Record<string, PaymentConfig> = {
  paytr: {
    provider: "paytr" as any,
    enabled: false, // Etkinleştirmek için true yapın
    api_key: process.env.PAYTR_API_KEY || "",
    merchant_id: process.env.PAYTR_MERCHANT_ID || "",
    api_secret: process.env.PAYTR_API_SECRET || "",
    sandbox_mode: process.env.NODE_ENV !== "production",
    allowed_installments: [1, 2, 3, 6, 9, 12],
    min_amount: 100,
    max_amount: 1000000,
    webhook_url: process.env.PAYTR_WEBHOOK_URL,
    return_url: process.env.PAYTR_RETURN_URL,
  },

  iyzipay: {
    provider: "iyzipay" as any,
    enabled: false, // Etkinleştirmek için true yapın
    api_key: process.env.IYZIPAY_API_KEY || "",
    merchant_id: process.env.IYZIPAY_MERCHANT_ID || "",
    api_secret: process.env.IYZIPAY_API_SECRET || "",
    sandbox_mode: process.env.NODE_ENV !== "production",
    allowed_installments: [1, 2, 3, 6, 9, 12],
    min_amount: 50,
    max_amount: 500000,
    webhook_url: process.env.IYZIPAY_WEBHOOK_URL,
    return_url: process.env.IYZIPAY_RETURN_URL,
  },

  param: {
    provider: "param" as any,
    enabled: false, // Etkinleştirmek için true yapın
    api_key: process.env.PARAM_API_KEY || "",
    merchant_id: process.env.PARAM_MERCHANT_ID || "",
    api_secret: process.env.PARAM_API_SECRET || "",
    sandbox_mode: process.env.NODE_ENV !== "production",
    allowed_installments: [1, 2, 3, 6, 9, 12],
    min_amount: 100,
    max_amount: 999999,
    webhook_url: process.env.PARAM_WEBHOOK_URL,
    return_url: process.env.PARAM_RETURN_URL,
  },

  nestpay: {
    provider: "nestpay" as any,
    enabled: false, // Etkinleştirmek için true yapın
    api_key: process.env.NESTPAY_API_KEY || "",
    merchant_id: process.env.NESTPAY_MERCHANT_ID || "",
    api_secret: process.env.NESTPAY_API_SECRET || "",
    sandbox_mode: process.env.NODE_ENV !== "production",
    allowed_installments: [1, 2, 3, 6, 9],
    min_amount: 100,
    max_amount: 999999,
    webhook_url: process.env.NESTPAY_WEBHOOK_URL,
    return_url: process.env.NESTPAY_RETURN_URL,
  },
};

/**
 * Etkin Sanal POS'u bul
 */
export function getEnabledPosProvider(): string | null {
  for (const [key, config] of Object.entries(POS_CONFIGS)) {
    if (config.enabled) {
      return key;
    }
  }
  return null;
}

/**
 * POS Sağlayıcısının Konfigürasyonunu Al
 */
export function getPosConfig(provider: string): PaymentConfig | null {
  return POS_CONFIGS[provider.toLowerCase()] || null;
}

/**
 * Ödeme Sağlayıcısı Fabrikası
 * Seçilen POS'a göre doğru implementasyon döndürür
 */
export async function createPosProvider(
  provider: string
): Promise<IPosProvider | null> {
  const config = getPosConfig(provider);

  if (!config || !config.enabled) {
    console.warn(`Payment provider ${provider} is not enabled`);
    return null;
  }

  try {
    // Dinamik olarak POS implementasyonunu yükle
    const module = await import(`./providers/${provider}.provider`);
    return new module.default(config);
  } catch (error) {
    console.error(`Failed to load payment provider: ${provider}`, error);
    return null;
  }
}

/**
 * Tüm Etkin POS Sağlayıcılarını Al
 */
export function getEnabledProviders(): PaymentConfig[] {
  return Object.values(POS_CONFIGS).filter((config) => config.enabled);
}

interface PaymentStatus {
  status: string;
  [key: string]: unknown;
}
