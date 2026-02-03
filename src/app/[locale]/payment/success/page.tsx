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
    const reference = urlReference || '';

    // Initialize displayId only for Bank Transfer (where it's passed directly)
    // For PayTR (oid), we wait until verifyPayTROrder finds it in the database
    const [displayId, setDisplayId] = useState<string | null>(urlReference);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Clear cart on successful payment arrival
        clearCart();
        // Clear session
        sessionStorage.removeItem("checkout_session_id");
    }, [clearCart]);

    useEffect(() => {
        const verifyPayTROrder = async () => {
            if (oid && !urlReference) {
                setIsChecking(true);
                // Poll a few times to see if order arrives
                let attempts = 0;
                const max = 15; // Increased attempts
                const interval = setInterval(async () => {
                    attempts++;
                    const { data } = await supabase
                        .from('orders')
                        .select('id, payment_reference')
                        .eq('payment_provider_reference', oid)
                        .maybeSingle();

                    if (data) {
                        // Confirmed - Use the database-generated payment_reference for display
                        setDisplayId(((data as any).payment_reference || (data as any).id).toString());
                        clearInterval(interval);
                        setIsChecking(false);
                    } else if (attempts >= max) {
                        clearInterval(interval);
                        setIsChecking(false);
                        // If still not found, we could fallback to oid if we really want,
                        // but better to show a "Contact Support" if it's missing.
                        // For now we just stop checking.
                    }
                }, 2000); // 2 second interval
            }
        };

        verifyPayTROrder();
    }, [oid, urlReference]);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'conversion', {
                'send_to': 'AW-788786685/hE82CKyzt_AZEP3bj_gC'
            });
        }
    }, []);


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Siparişiniz Alındı!
                </h1>

                {displayId ? (
                    <p className="text-lg font-semibold text-blue-600 mb-4 animate-in fade-in zoom-in duration-500">
                        Sipariş No: #{displayId}
                    </p>
                ) : isChecking ? (
                    <div className="flex flex-col items-center justify-center space-y-2 mb-4">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                        </div>
                        <span className="text-lg font-medium text-blue-600">Sipariş Numaranız Hazırlanıyor...</span>
                    </div>
                ) : null}

                {isChecking && <p className="text-xs text-gray-400 mb-4 italic">Ödeme onayı bekleniyor, lütfen sayfayı kapatmayınız.</p>}

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
