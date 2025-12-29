import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, userData, cartItems, totalAmount } = body;

        let id = sessionId;

        // If no sessionId provided, create a new one
        if (!id) {
            id = crypto.randomUUID().replace(/-/g, "");
        }

        // Get initial status ID
        const { data: statusData } = await supabaseAdmin
            .from('status')
            .select('id')
            .eq('name', 'order_received')
            .single();

        const sessionData = {
            id: id,
            user_data: userData || {},
            cart_items: cartItems || [],
            total_amount: totalAmount || 0,
            status: "new",
        };

        const { data, error } = await supabaseAdmin
            .from("checkout_sessions")
            .upsert(sessionData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error("Session Upsert Error:", error);
            return NextResponse.json(
                { error: "Could not sync checkout session" },
                { status: 500 }
            );
        }

        return NextResponse.json({ sessionId: id, session: data });

    } catch (error: any) {
        console.error("Checkout Session Route Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
