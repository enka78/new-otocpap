// Ödeme İşleme API Route'u
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PaymentStatus } from "@/types/payment";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/payment/process
 * Ödeme işlemini başlatır
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      amount,
      currency,
      payment_method,
      card_data,
      installment_count = 1,
    } = body;

    // Validasyon
    if (!order_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Kullanıcı kontrolü
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // İşlem kaydını oluştur
    const transaction_id = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const { data: transaction, error: insertError } = await supabase
      .from("payment_transactions")
      .insert([
        {
          id: transaction_id,
          order_id,
          user_id: user.id,
          payment_method,
          amount,
          currency,
          status: PaymentStatus.PROCESSING,
          installment_count: installment_count > 1 ? installment_count : null,
          metadata: {
            user_agent: request.headers.get("user-agent"),
            ip_address: request.headers.get("x-forwarded-for"),
          },
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating transaction:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // Ödeme yöntemi özelinde işlem yapılacak
    // HENÜZ SANAl POS SEÇİLMEDİĞİ İÇİN, DEMO OLARAK BAŞARILI DÖNÜŞ YAPIPILıYOR

    // Gerçek implementasyon için:
    // 1. POS sağlayıcı türü belirle
    // 2. İlgili provider modülünü yükle
    // 3. Ödeme isteğini işle
    // 4. Sonuç transaction'a kaydet

    // Demo: Başarılı ödeme simülasyonu
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: PaymentStatus.COMPLETED,
        payment_gateway_reference: `ref_${Date.now()}`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", transaction_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction_id: updatedTransaction.id,
      status: updatedTransaction.status,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
