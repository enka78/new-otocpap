"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { supabase, getProductImageUrl } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { User } from "@/types/user";
import { MapPin, Truck, Globe, CreditCard, Building2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define Address Data Interface (reused/adapted)
interface AddressData {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    district: string;
    city: string;
    postalCode: string;
    country: string;
    deliveryType: "istanbul-installation" | "domestic-cargo" | "international-cargo";
    onlineSupport: boolean;
    notes: string;
}

export default function PaymentPage() {
    const t = useTranslations();
    const { cartItems, getTotalPrice, getShippingCost, getFinalTotal, clearCart } = useCart();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [step, setStep] = useState<"address" | "payment">("address");
    const [paymentMethod, setPaymentMethod] = useState<"paytr" | "bank">("paytr");
    const [user, setUser] = useState<User | null>(null);

    // Address State
    const [addressData, setAddressData] = useState<AddressData>({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        district: "",
        city: "",
        postalCode: "",
        country: "Türkiye",
        deliveryType: "istanbul-installation",
        onlineSupport: false,
        notes: "",
    });

    // Load User Data
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) {
                setAddressData((prev) => ({
                    ...prev,
                    fullName: user.user_metadata?.full_name || "",
                    email: user.email || "",
                }));
            }
        });

        // Check cart
        if (cartItems.length === 0) {
            // If cart empty, redirect to home or products?
            // router.push("/"); // Disabled for now to allow viewing page
        }
    }, [cartItems.length, router]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setAddressData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("payment");
    };

    // PayTR Payment Handler
    const startPaytrPayment = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/paytr/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: { ...user, ...addressData }, // Combine user auth data with form data
                    cartItems,
                    totalAmount: getFinalTotal(),
                }),
            });

            const data = await res.json();

            if (data.token) {
                setIframeUrl(data.iframeUrl);
            } else {
                alert("Ödeme başlatılamadı: " + (data.error || "Bilinmeyen hata"));
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // Bank Transfer Handler
    const handleBankTransfer = async () => {
        setLoading(true);
        try {
            // We must creates order immediately for transfer
            // Reuse logic from previous CheckoutModal where we insert into 'orders'
            // status_id = 1 (Received / Pending Transfer)

            const orderProducts = cartItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: (item as any).price || 0,
                product_name: item.product.name,
                product_image: item.product.image1,
                product_brand: item.product.brand_id,
                product_category: item.product.category_id,
            }));

            const customerInfo = {
                user_id: user?.id,
                name: addressData.fullName,
                email: addressData.email,
                phone: addressData.phone,
                address: {
                    full_address: addressData.address,
                    district: addressData.district,
                    city: addressData.city,
                    postal_code: addressData.postalCode,
                    country: addressData.country
                },
                delivery_type: addressData.deliveryType,
                online_support: addressData.onlineSupport,
                notes: addressData.notes
            };

            // Generate a readable payment reference (e.g. 8 chars alphanumeric)
            const paymentRef = "BT" + Math.random().toString(36).substring(2, 10).toUpperCase();

            const orderData = {
                products: JSON.stringify(orderProducts),
                status_id: 1, // Assuming 1 = Pending/Received
                total: getFinalTotal(),
                currency: "TL",
                user: JSON.stringify(customerInfo),
                payment_method: "bank_transfer",
                payment_reference: paymentRef
            };

            const { data, error } = await supabase.from("orders").insert([orderData]).select().single();

            if (error) throw error;

            // Clear cart & Redirect
            clearCart();
            // Use payment_reference as the displayed order ID
            const orderId = data.payment_reference || data.id;
            router.push(`/payment/success?method=bank&orderId=${orderId}`);

        } catch (err) {
            console.error(err);
            alert("Sipariş oluşturulurken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };


    // Render Iframe
    useEffect(() => {
        if (iframeUrl) {
            // Iframe resizing logic is handled by PayTR script usually
            // But we just render the iframe tag they provide URL for 
            // URL Structure: https://www.paytr.com/odeme/guvenli/{token}
        }
    }, [iframeUrl]);

    return (
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto">
                {/* Header - Compact */}
                <div className="mb-4 relative">
                    <button onClick={() => router.push(`/${t('locale.code')}/products`)} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        ← {t('cart.continueShopping') || "Alışverişe Devam Et"}
                    </button>
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            {step === 'address' ? t('checkout.deliveryInfo') : t('checkout.paymentSelection')}
                        </h1>
                    </div>
                    <div className="mt-1 flex justify-center items-center space-x-2 text-sm text-gray-500">
                        <div className="relative w-24 h-6">
                            <Image src="/PayTR-Logo-Color.svg" alt="PayTR" fill className="object-contain" />
                        </div>
                        <div className="flex items-center">
                            <ShieldCheck className="w-4 h-4 text-green-600 mr-1" />
                            <span>Guvenli Ödeme</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className={`p-4 md:p-8 ${step === 'address' ? '' : 'grid lg:grid-cols-2 gap-8'}`}>

                        {/* Address Form Step */}
                        {step === "address" && (
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                {/* Personal Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="fullName" value={addressData.fullName} onChange={handleInputChange}
                                        placeholder={t("checkout.fullName")} required
                                        className="input-field border p-3 rounded-lg w-full"
                                    />
                                    <input
                                        name="phone" value={addressData.phone} onChange={handleInputChange}
                                        placeholder={t("checkout.phone")} required
                                        className="input-field border p-3 rounded-lg w-full"
                                    />
                                    <input
                                        name="email" value={addressData.email} onChange={handleInputChange}
                                        type="email" placeholder={t("checkout.email")} required
                                        className="input-field border p-3 rounded-lg w-full md:col-span-2"
                                    />
                                </div>

                                {/* Address */}
                                <textarea
                                    name="address" value={addressData.address} onChange={handleInputChange}
                                    placeholder={t("checkout.address")} required rows={2}
                                    className="input-field border p-3 rounded-lg w-full"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <input name="district" value={addressData.district} onChange={handleInputChange} placeholder={t("checkout.district")} required className="border p-3 rounded-lg w-full" />
                                    <input name="city" value={addressData.city} onChange={handleInputChange} placeholder={t("checkout.city")} required className="border p-3 rounded-lg w-full" />
                                    <input name="postalCode" value={addressData.postalCode} onChange={handleInputChange} placeholder={t("checkout.postalCode")} className="border p-3 rounded-lg w-full" />
                                    <select name="country" value={addressData.country} onChange={handleInputChange} disabled className="border p-3 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed">
                                        <option value="Türkiye">Türkiye</option>
                                    </select>
                                </div>

                                {/* Delivery Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="deliveryType" value="istanbul-installation" checked={addressData.deliveryType === 'istanbul-installation'} onChange={handleInputChange} className="mr-3 w-4 h-4" />
                                        <MapPin className="text-blue-600 mr-2 flex-shrink-0 w-5 h-5" />
                                        <span className="text-sm">{t("checkout.istanbulInstallation")}</span>
                                    </label>
                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="deliveryType" value="domestic-cargo" checked={addressData.deliveryType === 'domestic-cargo'} onChange={handleInputChange} className="mr-3 w-4 h-4" />
                                        <Truck className="text-orange-600 mr-2 flex-shrink-0 w-5 h-5" />
                                        <span className="text-sm">{t("checkout.domesticCargo")}</span>
                                    </label>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg">
                                    {t("checkout.continue")}
                                </button>
                            </form>
                        )}


                        {/* Payment Step */}
                        {step === "payment" && (
                            <>
                                {/* Left Col: Order Summary (Desktop) / Top (Mobile) */}
                                <div className="order-2 lg:order-1">
                                    <div className="bg-gray-50 p-6 rounded-xl h-full border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{t("checkout.orderSummary")}</h3>

                                        {/* Scrollable Cart Items Area */}
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2">
                                            {cartItems.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded bg-gray-200 mr-3 flex-shrink-0 overflow-hidden relative">
                                                            {item.product.image1 && <Image src={getProductImageUrl(item.product.image1)} alt={item.product.name} fill className="object-cover" />}
                                                        </div>
                                                        <span className="text-gray-700 line-clamp-1 max-w-[150px]">{item.product.name}</span>
                                                    </div>
                                                    <span className="font-medium">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">Ara Toplam</span>
                                            <span className="font-medium">₺{getTotalPrice().toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">Kargo</span>
                                            <span className="font-medium text-green-600">
                                                {getShippingCost() === 0 ? "Ücretsiz" : `₺${getShippingCost().toLocaleString("tr-TR")}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xl font-bold text-blue-600 mt-2">
                                            <span>Toplam</span>
                                            <span>₺{getFinalTotal().toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <button onClick={() => setStep("address")} className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm underline text-center">
                                            Teslimat bilgilerini düzenle
                                        </button>
                                    </div>
                                </div>

                                {/* Right Col: Payment Selection (Desktop) / Bottom (Mobile) */}
                                <div className="order-1 lg:order-2">
                                    {!iframeUrl ? (
                                        <div className="h-full flex flex-col justify-center">
                                            <h3 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h3>

                                            <div className="space-y-3 mb-6">
                                                <label className={`flex flex-row items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'paytr' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'}`}>
                                                    <input type="radio" name="payment" value="paytr" checked={paymentMethod === 'paytr'} onChange={() => setPaymentMethod('paytr')} className="w-5 h-5 text-blue-600 mr-4" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-gray-900">Kredi / Banka Kartı</span>
                                                            <div className="relative w-16 h-5">
                                                                <Image src="/PayTR-Logo-Color.svg" alt="PayTR" fill className="object-contain" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PayTR güvencesiyle 12 taksite kadar</p>
                                                    </div>
                                                </label>

                                                <label className={`flex flex-row items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'}`}>
                                                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="w-5 h-5 text-blue-600 mr-4" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-1">
                                                            <span className="font-bold text-gray-900">Havale / EFT</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">%5 İndirim fırsatı</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {paymentMethod === 'paytr' ? (
                                                <button onClick={startPaytrPayment} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-lg transform active:scale-95">
                                                    {!loading && (
                                                        <div className="ml-3 h-6 w-6 relative">
                                                            <Image src="/PayTR-Fav.svg" alt="PayTR" fill className="object-contain brightness-0 invert" />
                                                        </div>
                                                    )}
                                                    {loading ? "İşleniyor..." : "Güvenli Ödeme Yap"}
                                                </button>
                                            ) : (
                                                <button onClick={handleBankTransfer} disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg">
                                                    {loading ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="col-span-1 lg:col-span-2 w-full">
                                            <iframe
                                                src={iframeUrl}
                                                className="w-full min-h-[600px] border-0 rounded-lg"
                                                style={{ width: '100%' }}
                                                allow="payment"
                                            ></iframe>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
