export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { paytrService } from "@/lib/paytr";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    // PayTR sends x-www-form-urlencoded data
    const formData = await req.formData();
    const merchant_oid = (formData.get("merchant_oid") ?? "").toString().trim();
    const status = formData.get("status") as string;
    const total_amount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    console.log("🔥 PAYTR NOTIFY HIT", { merchant_oid, status, total_amount });

    // Optional fields often sent by PayTR
    const fail_reason = formData.get("failed_reason_msg");

    console.log("📝 Callback Data:", { merchant_oid, status, total_amount, hash });

    // 1. Verify Hash
    const isValid = paytrService.validateCallback({
      merchant_oid,
      status,
      total_amount,
      hash,
    });

    if (!isValid) {
      console.error("❌ PayTR Callback: Invalid Hash");
      return new NextResponse("OK");
    }

    console.log("✅ Hash Validated");

    // 2. Handle Payment Status
    if (status === "success") {
      // Payment Successful
      console.log(`💰 Payment Success for Session ${merchant_oid}`);

      // A. Retrieve Session Data
      const { data: sessionData, error: sessionFetchError } = await supabaseAdmin
        .from("checkout_sessions")
        .select("*")
        .eq("id", merchant_oid)
        .maybeSingle();

      if (sessionFetchError) {
        console.error("❌ Session Fetch Error:", sessionFetchError);
      }

      if (!sessionData) {
        console.warn(
          "⚠️ Session not found, probably already processed:",
          merchant_oid
        );
        return new NextResponse("OK");
      }

      console.log("📄 Session Data Found:", sessionData.id);

      if (sessionData.status === "processed") {
        console.log("⏭️ Session already processed");
        return new NextResponse("OK");
      }

      // Verify Amount (Security Check)
      const sessionTotal = sessionData.total_amount as number;
      const expectedAmount = Math.round(sessionTotal * 100);
      if (parseInt(total_amount) !== expectedAmount) {
        console.error(
          `❌ Amount Mismatch! Expected: ${expectedAmount}, Received: ${total_amount}`
        );
        return new NextResponse("PAYTR notification failed: amount mismatch");
      }

      // B. Create Real Order
      // Get 'order_received' status ID dynamically
      const { data: statusData, error: statusError } = await supabaseAdmin
        .from('status')
        .select('id')
        .eq('name', 'order_received')
        .single();

      const statusId = statusData?.id || 1;
      if (statusError) {
        console.warn("⚠️ Status fetch error, using default 1:", statusError);
      }

      // 2. Map cart items to orderProducts structure
      const sData = sessionData as any;
      const orderProducts = sData.cart_items.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        product_name: item.product?.name,
        product_image: item.product?.image1,
        product_brand: item.product?.brand_id,
        product_category: item.product?.category_id,
      }));

      // 3. Map user data to customerInfo structure
      const u = sData.user_data;
      const customerInfo = {
        user_id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        address: {
          full_address: u.address,
          district: u.district,
          city: u.city,
          postal_code: u.postalCode,
          country: u.country || "Türkiye",
        },
        delivery_type: u.deliveryType,
        online_support: u.onlineSupport,
        notes: u.notes,
      };

      const orderData = {
        products: JSON.stringify(orderProducts),
        status_id: statusId,
        total: sessionData.total_amount,
        currency: "TL",
        user: JSON.stringify(customerInfo),
        payment_method: "credit_card",
        payment_provider_reference: merchant_oid,
      };

      console.log("📦 Preparing Order Data:", orderData);

      // Update Session Status - Use both for compatibility if needed
      const { error: sessionUpdateError } = await supabaseAdmin
        .from("checkout_sessions")
        .update({
          status: "processed"
        })
        .eq("id", merchant_oid);

      if (sessionUpdateError) {
        console.error("❌ Session Status Update Error:", sessionUpdateError);
      }

      // Insert Order
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error("❌ Order Insertion Failed:", orderError);
        return new NextResponse("Order insertion failed", { status: 500 });
      }

      console.log("🎊 Order Created Successfully:", newOrder.id);
    } else {
      // Payment Failed
      console.log(`❌ Payment Failed for Order ${merchant_oid}: ${fail_reason}`);

      // Try to get payment_failed status ID
      const { data: failStatus } = await supabaseAdmin
        .from('status')
        .select('id')
        .eq('name', 'payment_failed')
        .maybeSingle();

      await supabaseAdmin
        .from("checkout_sessions")
        .update({
          status: "failed"
        })
        .eq("id", merchant_oid);
    }

    return new NextResponse("OK");
  } catch (error) {
    console.error("💥 PayTR Callback Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
