// POS Sağlayıcı İmplementasyonu Örneği
// Bu dosya, yeni bir POS sağlayıcı eklemek istediğinizde şablon olarak kullanılabilir

import { IPosProvider } from "@/lib/payment-config";
import {
  PaymentRequest,
  PaymentResponse,
  PaymentWebhook,
} from "@/types/payment";
import { PaymentConfig } from "@/types/payment";

/**
 * PayTR Ödeme Sağlayıcısı Implementasyonu
 * Şu an DISABLED durumda, etkinleştirmek için payment-config.ts dosyasını güncelleyin
 */
export class PayTRProvider implements IPosProvider {
  name = "PayTR";
  provider = "paytr";

  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  /**
   * Ödeme başlatma
   * PayTR API'sine istek gönderir
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        merchant_id: this.config.merchant_id,
        user_ip: request.metadata?.ip_address || "0.0.0.0",
        merchant_oid: `${request.order_id}`,
        email: request.customer_email,
        payment_amount: Math.round(request.amount * 100), // Kuruş cinsinden
        instantnotification_url: this.config.webhook_url,
        return_url: request.return_url || this.config.return_url,
        currency: "TL",
        test_mode: this.config.sandbox_mode ? 1 : 0,
        timeout_limit: 30,
        customer_name: request.customer_name,
        customer_phone: request.customer_phone,
        // Taksit bilgileri
        installment_count: request.installment_count || 1,
      };

      // Güvenlik anahtarı oluştur
      const hash = this.createSecureHash(payload);

      // PayTR API'ne çağrı
      const response = await fetch(
        "https://www.paytr.com/odeme/api/get-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body:
            new URLSearchParams(
              Object.entries(payload).map(([key, value]) => [
                key,
                String(value),
              ])
            ).toString() + `&paytr_token=${hash}`,
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        return {
          success: true,
          transaction_id: `${request.order_id}`,
          payment_url: `https://www.paytr.com/odeme/${result.token}`,
          message: "Payment initialized successfully",
        };
      } else {
        return {
          success: false,
          error_code: result.error_code,
          error_message: result.reason || "Payment initialization failed",
          message: "Payment initialization failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        message: "Payment initialization failed",
      };
    }
  }

  /**
   * Ödeme durumunu sorgula
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    // PayTR API'sine durumu sorgulama isteği
    const payload = {
      merchant_id: this.config.merchant_id,
      merchant_oid: transactionId,
    };

    const hash = this.createSecureHash(payload);

    try {
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      params.append("paytr_token", hash);

      const response = await fetch(
        "https://www.paytr.com/odeme/api/check-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      return await response.json();
    } catch (error) {
      return {
        status: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(
    transactionId: string,
    amount: number
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        merchant_id: this.config.merchant_id,
        merchant_oid: transactionId,
        refund_amount: Math.round(amount * 100), // Kuruş cinsinden
      };

      const hash = this.createSecureHash(payload);

      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      params.append("paytr_token", hash);

      const response = await fetch("https://www.paytr.com/odeme/api/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const result = await response.json();

      return {
        success: result.status === "success",
        message: result.reason || "Refund processed",
        reference: result.ref_id,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Refund failed",
      };
    }
  }

  /**
   * Webhook imzasını doğrula
   */
  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    try {
      const hash = this.createSecureHash(payload as Record<string, unknown>);
      return hash === signature;
    } catch {
      return false;
    }
  }

  /**
   * Webhook verilerini işle
   */
  parseWebhookData(payload: any): PaymentWebhook {
    return {
      transaction_id: payload.merchant_oid,
      order_id: parseInt(payload.merchant_oid),
      status:
        payload.status === "success" ? ("completed" as any) : ("failed" as any),
      amount: payload.amount / 100, // Kuruştan TL'ye
      currency: "TRY",
      reference: payload.transaction_id,
      error_code: payload.error_code,
      error_message: payload.reason,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PayTR güvenlik anahtarı oluştur
   */
  private createSecureHash(data: Record<string, unknown>): string {
    const crypto = require("crypto");

    // Veri sırasını belirle
    const keys = Object.keys(data).sort();
    let hashValue = "";

    for (const key of keys) {
      hashValue += `${key}=${data[key]}`;
    }

    hashValue += this.config.api_secret;

    const hash = crypto
      .createHmac("sha256", this.config.api_secret)
      .update(hashValue)
      .digest("hex");

    return hash;
  }
}

export default PayTRProvider;
