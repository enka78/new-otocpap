/**
 * Havale / EFT ile sipariş oluşturma endpoint'i
 * Frontend'den direkt supabase client kullanımını önler,
 * sipariş oluşturma ve e-posta bildirimlerini server-side yönetir.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderEmails } from "@/lib/email";
import type { OrderEmailParams } from "@/lib/order-email-templates";

interface BankOrderProduct {
    product_id: number | string;
    quantity: number;
    price: number;
    product_name: string;
    product_image?: string;
    product_brand?: number | string;
    product_category?: number | string;
}

interface BankOrderRequest {
    sessionId: string | null;
    customerInfo: {
        user_id: string;
        name: string;
        email: string;
        phone: string;
        address: {
            full_address: string;
            district: string;
            city: string;
            postal_code: string;
            country: string;
        };
        delivery_type: string;
        online_support: boolean;
        notes: string;
    };
    orderProducts: BankOrderProduct[];
    amountToPay: number;
}

export async function POST(req: NextRequest) {
    try {
        const body: BankOrderRequest = await req.json();
        const { sessionId, customerInfo, orderProducts, amountToPay } = body;

        // Temel validasyon
        if (!customerInfo?.email || !customerInfo?.name || !amountToPay) {
            return NextResponse.json(
                { error: "Eksik sipariş bilgisi" },
                { status: 400 }
            );
        }

        // Sipariş durumunu getir
        const { data: statusData } = await supabaseAdmin
            .from("status")
            .select("id")
            .eq("name", "order_received")
            .single();

        const paymentRef =
            "BT" + Math.random().toString(36).substring(2, 10).toUpperCase();

        const orderData = {
            products: JSON.stringify(orderProducts),
            status_id: statusData?.id ?? 1,
            total: amountToPay,
            currency: "TL",
            user: JSON.stringify(customerInfo),
            payment_method: "bank_transfer",
            payment_provider_reference: sessionId ?? paymentRef,
        };

        const { data: newOrder, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert([orderData])
            .select()
            .single();

        if (orderError) {
            console.error("[BankOrder] Sipariş oluşturma hatası:", orderError);
            return NextResponse.json(
                { error: "Sipariş oluşturulamadı" },
                { status: 500 }
            );
        }

        // E-posta bildirimleri (sipariş oluşturulduktan sonra await ile gönderilir)
        const emailParams: OrderEmailParams = {
            orderNumber: (newOrder.payment_provider_reference ?? newOrder.id).toString(),
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            deliveryType: customerInfo.delivery_type,
            address: customerInfo.address.full_address,
            district: customerInfo.address.district,
            city: customerInfo.address.city,
            country: customerInfo.address.country,
            totalAmount: amountToPay.toFixed(2),
            paymentMethod: "bank_transfer",
            products: orderProducts.map((p) => ({
                name: p.product_name ?? "Ürün",
                quantity: p.quantity,
                price: p.price.toFixed(2),
            })),
            notes: customerInfo.notes || undefined,
        };

        await sendOrderEmails(emailParams);

        return NextResponse.json({
            success: true,
            orderId: newOrder.payment_provider_reference ?? newOrder.id,
            order: newOrder,
        });
    } catch (error) {
        console.error("[BankOrder] Beklenmeyen hata:", error);
        return NextResponse.json(
            { error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
