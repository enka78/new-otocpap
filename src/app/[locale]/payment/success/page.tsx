"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const method = searchParams.get("method");

    // "orderId" will now be the payment_reference (string) for Bank Transfer
    // "oid" is the payment_reference for PayTR
    const urlReference = searchParams.get("orderId"); // From Bank Transfer
    const oid = searchParams.get("oid"); // From PayTR

    // Use whichever exists.
    const reference = urlReference || oid;

    // State to hold the final display string (usually just the reference)
    // But we might want to check if the order exists in DB to be sure?
    // For PayTR, order creation is async, so we might need to poll if we want to confirm details.
    // For Bank, it's already created.

    // However, the user request says: "bu alandaki numarayı kullanıcıya sipariş numarası olarak göstermeliyiz"
    // So we just show the reference.

    // IF PayTR -> oid is the reference. But does it exist in "orders" yet?
    // User wants to ensure "payment_reference" column's value is what is shown.
    // oid IS that value (we insert it in notify route).

    // So we can just display 'reference'. 
    // BUT for safety/UX, let's verify Order existence for PayTR if 'oid' is present.

    const [displayId, setDisplayId] = useState<string | null>(reference);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Clear cart on successful payment arrival
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        const verifyPayTROrder = async () => {
            if (oid && !urlReference) {
                setIsChecking(true);
                // Poll a few times to see if order arrives
                let attempts = 0;
                const max = 5;
                const interval = setInterval(async () => {
                    attempts++;
                    const { data } = await supabase
                        .from('orders')
                        .select('payment_reference')
                        .eq('payment_reference', oid)
                        .maybeSingle();

                    if (data) {
                        // Confirmed
                        clearInterval(interval);
                        setIsChecking(false);
                    } else if (attempts >= max) {
                        clearInterval(interval);
                        setIsChecking(false);
                        // Still show the oid, it's the reference anyway.
                    }
                }, 1000);
            }
        };

        verifyPayTROrder();
    }, [oid, urlReference]);


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Siparişiniz Alındı!
                </h1>

                {displayId && (
                    <p className="text-lg font-semibold text-blue-600 mb-4">
                        Sipariş No: #{displayId}
                    </p>
                )}

                {isChecking && <p className="text-sm text-gray-500 mb-4">Sipariş onayı kontrol ediliyor...</p>}

                <p className="text-gray-600 mb-8">
                    {method === "bank"
                        ? "Siparişiniz başarıyla oluşturuldu. Havale/EFT işlemini tamamladığınızda siparişiniz onaylanacaktır."
                        : "Ödeme işleminiz başarıyla tamamlandı. Sipariş detayları e-posta adresinize gönderildi."}
                </p>

                {method === "bank" && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-8 text-left">
                        <h3 className="font-semibold text-blue-900 mb-2">Banka Hesap Bilgileri:</h3>
                        <p className="text-blue-800">Banka: {process.env.NEXT_PUBLIC_BANK_NAME || 'Vakıf Bankası'}</p>
                        <p className="text-blue-800">Alıcı: {process.env.NEXT_PUBLIC_BANK_RECIPIENT || 'Dönüşüm Medikal Ve Sağlık Hizmetleri Ticaret Limited Şirketi'}</p>
                        <p className="text-blue-800">IBAN: {process.env.NEXT_PUBLIC_BANK_IBAN || 'TR19 0001 5001 5800 7321 0459 85'}</p>
                        <p className="text-xs text-blue-600 mt-2">* Lütfen açıklama kısmına <strong>{displayId}</strong> numaralı sipariş kodunu yazınız.</p>
                    </div>
                )}

                <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
