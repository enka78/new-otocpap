import crypto from "crypto";

interface PaytrTokenParams {
  merchant_oid: string;
  email: string;
  payment_amount: number; // In kurus (100 * TL)
  user_basket: string; // [["product name", "price", "quantity"], ...]
  no_installment: number; // 0 or 1
  max_installment: number; // 0 to 12
  user_name: string;
  user_address: string;
  user_phone: string;
  currency: "TL" | "USD" | "EUR";
  test_mode?: "0" | "1";
}

interface PaytrConfig {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
}

export class PaytrService {
  private config: PaytrConfig;

  constructor() {
    this.config = {
      merchant_id: process.env.PAYTR_MERCHANT_ID || "649896",
      merchant_key:
        process.env.PAYTR_MERCHANT_KEY || process.env.PAYTR_API_KEY || "",
      merchant_salt: process.env.PAYTR_MERCHANT_SALT || "",
    };

    if (
      !this.config.merchant_id ||
      !this.config.merchant_key ||
      !this.config.merchant_salt
    ) {
      console.warn("PayTR environment variables are missing!");
    }
  }

  /**
   * Generates the PayTR token for the iframe.
   */
  async getIframeToken(params: PaytrTokenParams): Promise<string> {
    const {
      merchant_oid,
      email,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      user_name,
      user_address,
      user_phone,
      currency,
      test_mode = "0",
    } = params;

    const user_basket_json = JSON.stringify(user_basket);
    const merchant_ok_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/payment/success`;
    const merchant_fail_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/payment/error`;
    const timeout_limit = "30"; // 30 minutes
    const debug_on = "1"; // 1 for debug mode logs

    // Create string to hash
    // CONCAT(merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode)
    // IMPORTANT: user_ip is required in the hash but sent separately. Wait, docs say:
    // "paytr_token=..."
    // Let's implement the standard logical flow.

    // Note: We need the user IP. In Next.js App Router, we usually get this from headers.
    // For the service method, let's pass it as an argument or handle it outside.
    // Actually, checking standard implementation:
    // HASH = base64_encode(hash_hmac('sha256', concat_string + merchant_salt, merchant_key))

    // We will update the signature to accept client IP.
    throw new Error("Use getTokenWithIp instead");
  }

  async getIframeTokenWithIp(
    params: PaytrTokenParams,
    clientIp: string
  ): Promise<{ token: string; iframeUrl: string }> {
    const {
      merchant_oid,
      email,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      user_name,
      user_address,
      user_phone,
      currency,
      test_mode = "0",
    } = params;

    const user_basket_json = JSON.stringify(user_basket);
    // Replace hardcoded URLs with environment variables if needed
    const merchant_ok_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/payment/success?oid=${merchant_oid}`;
    const merchant_fail_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/payment/error?oid=${merchant_oid}`;
    const timeout_limit = "30";
    const debug_on = "1";

    // RELOAD CONFIG explicitly to ensure env vars are fresh
    this.config = {
      merchant_id: process.env.PAYTR_MERCHANT_ID || "",
      merchant_key:
        process.env.PAYTR_MERCHANT_KEY || process.env.PAYTR_API_KEY || "",
      merchant_salt: process.env.PAYTR_MERCHANT_SALT || "",
    };

    if (!this.config.merchant_key) {
      throw {
        message:
          "PAYTR_MERCHANT_KEY (veya PAYTR_API_KEY) eksik! Lütfen .env.local dosyasını kontrol edin.",
        debug: {
          env_keys: Object.keys(process.env).filter((k) =>
            k.startsWith("PAYTR")
          ),
        },
      };
    }

    const hashStr =
      this.config.merchant_id +
      clientIp +
      merchant_oid +
      email +
      payment_amount.toString() +
      user_basket_json +
      no_installment.toString() +
      max_installment.toString() +
      currency +
      test_mode;

    const paytr_token = crypto
      .createHmac("sha256", this.config.merchant_key)
      .update(hashStr + this.config.merchant_salt)
      .digest("base64");

    const formData = new URLSearchParams();
    formData.append("merchant_id", this.config.merchant_id);
    formData.append("user_ip", clientIp);
    formData.append("merchant_oid", merchant_oid);
    formData.append("email", email);
    formData.append("payment_amount", payment_amount.toString());
    formData.append("paytr_token", paytr_token);
    formData.append("user_basket", user_basket_json);
    formData.append("debug_on", debug_on);
    formData.append("no_installment", no_installment.toString());
    formData.append("max_installment", max_installment.toString());
    formData.append("user_name", user_name);
    formData.append("user_address", user_address);
    formData.append("user_phone", user_phone);
    formData.append("merchant_ok_url", merchant_ok_url);
    formData.append("merchant_fail_url", merchant_fail_url);
    formData.append("timeout_limit", timeout_limit);
    formData.append("currency", currency);
    formData.append("test_mode", test_mode);

    try {
      const response = await fetch(
        "https://www.paytr.com/odeme/api/get-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        return {
          token: data.token,
          iframeUrl: "https://www.paytr.com/odeme/guvenli/" + data.token,
        };
      } else {
        console.error("PayTR Token Error:", data.reason);
        throw new Error(data.reason);
      }
    } catch (error: any) {
      console.error("PayTR Request Failed:", error);
      throw error;
    }
  }

  /**
   * Validates the callback hash from PayTR
   */
  validateCallback(params: {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
  }): boolean {
    const { merchant_oid, status, total_amount, hash } = params;

    const hashStr =
      merchant_oid + this.config.merchant_salt + status + total_amount;

    const calculatedHash = crypto
      .createHmac("sha256", this.config.merchant_key)
      .update(hashStr)
      .digest("base64");



    return calculatedHash === hash;
  }
}

export const paytrService = new PaytrService();
