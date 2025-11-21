// Webhook Handler - POS Sağlayıcılarından Gelen Callback'ler
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PaymentStatus } from "@/types/payment";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/payment/webhook
 * Sanal POS sağlayıcılarından gelen webhook callback'lerini işler
 *
 * Hangi POS seçilirse, ilgili sağlayıcı doğrultusunda webhook işlenecektir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-webhook-signature");
    const provider = request.headers.get("x-payment-provider");

    // Webhook'un kaynağını doğrula
    if (!provider) {
      return NextResponse.json(
        { error: "Payment provider not specified" },
        { status: 400 }
      );
    }

    // İmza doğrulaması - Her POS için farklı
    if (!verifyWebhookSignature(body, signature, provider)) {
      console.warn(`Invalid webhook signature from provider: ${provider}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // POS sağlayıcısına göre webhook verilerini parse et
    const parsedData = parseWebhookData(body, provider);

    // İşlemi güncelle
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: parsedData.status,
        payment_gateway_reference: parsedData.reference,
        error_code: parsedData.error_code,
        error_message: parsedData.error_message,
        completed_at: parsedData.completed_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedData.transaction_id);

    if (updateError) {
      console.error("Error updating transaction from webhook:", updateError);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // Başarılı yanıt dön
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Webhook İmzasını Doğrula
 * Her POS sağlayıcı için farklı imza algoritması kullanılır
 */
function verifyWebhookSignature(
  payload: unknown,
  signature: string | null,
  provider: string
): boolean {
  if (!signature) return false;

  try {
    const secret = getWebhookSecret(provider);
    if (!secret) return false;

    // PayTR
    if (provider === "paytr") {
      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      return hash === signature;
    }

    // iyzipay
    if (provider === "iyzipay") {
      const hash = crypto
        .createHmac("sha1", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      return hash === signature;
    }

    // Diğer sağlayıcılar
    return true;
  } catch {
    return false;
  }
}

/**
 * Webhook Gizli Anahtarını Al
 */
function getWebhookSecret(provider: string): string | null {
  const secrets: Record<string, string | undefined> = {
    paytr: process.env.PAYTR_WEBHOOK_SECRET,
    iyzipay: process.env.IYZIPAY_WEBHOOK_SECRET,
    param: process.env.PARAM_WEBHOOK_SECRET,
    nestpay: process.env.NESTPAY_WEBHOOK_SECRET,
  };

  return secrets[provider.toLowerCase()] || null;
}

/**
 * POS Sağlayıcısının Webhook Verilerini Parse Et
 */
function parseWebhookData(
  payload: any,
  provider: string
): {
  transaction_id: string;
  status: PaymentStatus;
  reference?: string;
  error_code?: string;
  error_message?: string;
  completed_at?: string;
} {
  // PayTR Format
  if (provider === "paytr") {
    return {
      transaction_id: payload.merchant_oid || "",
      status:
        payload.status === "success"
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
      reference: payload.transaction_id,
      error_code: payload.error_code,
      error_message: payload.error_message,
      completed_at: new Date().toISOString(),
    };
  }

  // iyzipay Format
  if (provider === "iyzipay") {
    return {
      transaction_id: payload.conversationId || "",
      status:
        payload.status === "success"
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
      reference: payload.paymentId,
      error_code: payload.errorCode,
      error_message: payload.errorMessage,
      completed_at: new Date().toISOString(),
    };
  }

  // Param Format
  if (provider === "param") {
    return {
      transaction_id: payload.clientOrderId || "",
      status:
        payload.resultCode === "0000"
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
      reference: payload.orderId,
      error_code: payload.resultCode,
      error_message: payload.resultMsg,
      completed_at: new Date().toISOString(),
    };
  }

  // Varsayılan Format
  return {
    transaction_id: payload.transaction_id || "",
    status: PaymentStatus.PENDING,
  };
}
