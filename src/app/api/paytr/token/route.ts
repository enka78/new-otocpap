import { NextRequest, NextResponse } from "next/server";
import { paytrService } from "@/lib/paytr";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, cartItems, totalAmount } = body;

        /* ----------------------------------------------------
           1. CLIENT IP
        ---------------------------------------------------- */
        const forwarded = req.headers.get("x-forwarded-for");
        let ip =
            forwarded?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";

        if (ip === "::1" || ip === "::") ip = "127.0.0.1";

        /* ----------------------------------------------------
           2. merchant_oid (alphanumeric, no dash)
        ---------------------------------------------------- */
        const sessionId = crypto.randomUUID().replace(/-/g, "");

        /* ----------------------------------------------------
           3. USER BASKET (PHP ÖRNEĞİYLE BİREBİR)
           [["Ürün Adı","18.00",1], ...]
        ---------------------------------------------------- */
        const userBasketArray: any[][] = cartItems.map((item: any) => [
            String(item.product?.name || "Ürün"),
            Number(item.product?.price || 0).toFixed(2), // STRING
            Number(item.quantity || 1)
        ]);

        const user_basket: string = Buffer.from(
            JSON.stringify(userBasketArray),
            "utf-8"
        ).toString("base64");

        /* ----------------------------------------------------
           4. SAVE CHECKOUT SESSION
        ---------------------------------------------------- */
        const { error: sessionError } = await supabase
            .from("checkout_sessions")
            .insert({
                id: sessionId,
                user_data: user,
                cart_items: cartItems,
                total_amount: totalAmount,
                status: "new"
            });

        if (sessionError) {
            console.error("Session Create Error:", sessionError);
            return NextResponse.json(
                { error: "Could not create payment session" },
                { status: 500 }
            );
        }

        /* ----------------------------------------------------
           5. PAYTR AMOUNT (TL → Kuruş)
        ---------------------------------------------------- */
        const totalAmountKurus = Math.round(Number(totalAmount) * 100);

        /* ----------------------------------------------------
           6. SAFE ADDRESS (undefined FIX)
        ---------------------------------------------------- */
        const user_address =
            user?.address ||
            "Adres bilgisi girilmedi";

        /* ----------------------------------------------------
           7. PAYTR TOKEN REQUEST
        ---------------------------------------------------- */
        const { token, iframeUrl } =
            await paytrService.getIframeTokenWithIp(
                {
                    merchant_oid: sessionId,
                    email: user.email,
                    payment_amount: totalAmountKurus,
                    user_basket, // ✅ Base64(JSON)
                    no_installment: 0,
                    max_installment: 12,
                    user_name: user.fullName || user.name,
                    user_address,
                    user_phone: user.phone,
                    currency: "TL",
                    test_mode:
                        process.env.PAYTR_TEST_MODE === "1" ? "1" : "0"
                },
                ip
            );

        /* ----------------------------------------------------
           DEBUG (GEÇİCİ)
        ---------------------------------------------------- */
        console.log("USER_BASKET_DECODE:", Buffer.from(user_basket, "base64").toString("utf-8"));

        return NextResponse.json({ token, iframeUrl });

    } catch (error: any) {
        console.error("PayTR Token Route Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
