"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("fail_message") || "Ödeme işlemi tamamlanamadı.";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Ödeme Başarısız
                </h1>

                <p className="text-red-600 mb-8 bg-red-50 p-3 rounded-lg">
                    {reason}
                </p>

                <p className="text-gray-600 mb-8">
                    Lütfen kart bilgilerinizi kontrol edip tekrar deneyiniz veya farklı bir ödeme yöntemi seçiniz.
                </p>

                <div className="space-x-4">
                    <Link
                        href="/payment"
                        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                        Tekrar Dene
                    </Link>
                    <Link
                        href="/"
                        className="inline-block text-gray-600 hover:text-gray-900 px-4 py-3"
                    >
                        Ana Sayfa
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
