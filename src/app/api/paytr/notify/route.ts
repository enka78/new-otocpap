import { NextRequest, NextResponse } from "next/server";
import { paytrService } from "@/lib/paytr";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        // PayTR sends x-www-form-urlencoded data
        const formData = await req.formData();
        const merchant_oid = formData.get("merchant_oid") as string;
        const status = formData.get("status") as string;
        const total_amount = formData.get("total_amount") as string;
        const hash = formData.get("hash") as string;

        // Optional fields often sent by PayTR
        const fail_reason = formData.get("failed_reason_msg");

        // 1. Verify Hash
        const isValid = paytrService.validateCallback({
            merchant_oid,
            status,
            total_amount,
            hash,
        });

        if (!isValid) {
            console.error("PayTR Callback: Invalid Hash");
            return new NextResponse("PAYTR notification failed: bad hash");
        }

        // 2. Handle Payment Status
        if (status === "success") {
            // Payment Successful
            console.log(`Payment Success for Order ${merchant_oid}`);

            // A. Retrieve Session Data
            const { data: sessionData, error: sessionFetchError } = await supabase
                .from("checkout_sessions")
                .select("*")
                .eq("id", merchant_oid)
                .single();

            if (sessionFetchError || !sessionData) {
                console.error("Session Not Found:", sessionFetchError);
                return new NextResponse("OK");
            }

            if (sessionData.status === "processed") {
                // Already processed
                return new NextResponse("OK");
            }

            // Verify Amount (Security Check)
            const sessionTotal = sessionData.total_amount as number;
            const expectedAmount = Math.round(sessionTotal * 100);
            if (parseInt(total_amount) !== expectedAmount) {
                console.error(`Amount Mismatch! Expected: ${expectedAmount}, Received: ${total_amount}`);
                return new NextResponse("PAYTR notification failed: amount mismatch");
            }

            // B. Create Real Order

            // 1. Get status_id for 'order_received'
            const { data: statusData } = await supabase
                .from('status')
                .select('*')
                .eq('name', 'order_received')
                .single();

            const statusId = statusData?.id || 1;

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
                    country: u.country || "Türkiye"
                },
                delivery_type: u.deliveryType,
                online_support: u.onlineSupport,
                notes: u.notes
            };

            const orderData = {
                products: JSON.stringify(orderProducts),
                status_id: statusId,
                total: sessionData.total_amount,
                currency: "TL",
                user: JSON.stringify(customerInfo),
                payment_method: "credit_card",
                payment_reference: merchant_oid
            };

            // Update Session Status
            await supabase
                .from("checkout_sessions")
                .update({ status: "processed" })
                .eq("id", merchant_oid);

            // Insert Order
            const { error: orderError } = await supabase
                .from("orders")
                .insert([orderData]);

            if (orderError) {
                console.error("Failed to insert approved order:", orderError);
                return new NextResponse("Order insertion failed", { status: 500 });
            }

        } else {
            // Payment Failed
            console.log(`Payment Failed for Order ${merchant_oid}: ${fail_reason}`);

            await supabase
                .from("checkout_sessions")
                .update({ status: "failed" })
                .eq("id", merchant_oid);
        }

        return new NextResponse("OK");
    } catch (error) {
        console.error("PayTR Callback Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
