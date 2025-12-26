import { NextRequest, NextResponse } from "next/server";
import { paytrService } from "@/lib/paytr";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            user,
            cartItems,
            totalAmount
        } = body;

        // 1. Get User IP
        const forwarded = req.headers.get("x-forwarded-for");
        let ip = forwarded ? forwarded.split(",")[0] : (req.headers.get("x-real-ip") || "127.0.0.1");

        // Fix for IPv6 localhost
        if (ip === "::1" || ip === "::") {
            ip = "127.0.0.1";
        }

        // 2. Generate a unique Session ID (merchant_oid)
        // 2. Generate a unique Session ID (merchant_oid)
        // PayTR requires alphanumeric merchant_oid (no dashes)
        const sessionId = crypto.randomUUID().replace(/-/g, "");

        // 3. Prepare User Basket for PayTR
        // Format: [ ["Product Name", "Price", "Quantity"], ... ]
        const userBasket = cartItems.map((item: any) => [
            item.product.name,
            // PayTR expects price as string or number? documentation says:
            // "Örnek: [['Örnek Ürün 1', '50.00', 1], ['Örnek Ürün 2', '70.00', 1]]"
            // Wait, documentation says "fiyat bilgisi (küsürat olduğu takdirde '.' ile ayrılmalı)".
            // But payment_amount is in kurus (integer).
            // Let's ensure format matches.
            (item.product.price * 1).toFixed(2), // unit price
            item.quantity
        ]);

        // 4. Create Checkout Session in Database
        // This temporarily stores the order details until payment is confirmed.
        const { error: sessionError } = await supabase
            .from("checkout_sessions")
            .insert({
                id: sessionId,
                user_data: user, // JSONB
                cart_items: cartItems, // JSONB
                total_amount: totalAmount,
                status: "new"
            });

        if (sessionError) {
            console.error("Session Create Error:", sessionError);
            return NextResponse.json({ error: "Could not create payment session" }, { status: 500 });
        }

        // 5. Request Token from PayTR
        // payment_amount must be * 100 for PayTR (TL -> Kuruş) if integer required?
        // "payment_amount" parameter: "İşlem tutarı. (Örn: 10.05 TL için 1005 olarak gönderilmelidir)"
        const totalAmountKurus = Math.round(totalAmount * 100);

        const { token, iframeUrl } = await paytrService.getIframeTokenWithIp({
            merchant_oid: sessionId,
            email: user.email,
            payment_amount: totalAmountKurus,
            user_basket: userBasket,
            no_installment: 0,
            max_installment: 12, // Allow installments? Configurable.
            user_name: user.fullName || user.name, // Support both fields
            user_address: `${user.address.full_address} ${user.address.district} ${user.address.city}`, // Full address string
            user_phone: user.phone,
            currency: "TL",
            test_mode: process.env.PAYTR_TEST_MODE === "1" ? "1" : "0" // Use env var logic
        }, ip);

        return NextResponse.json({ token, iframeUrl });

    } catch (error: any) {
        console.error("PayTR Token Route Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
