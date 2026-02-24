"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Truck, Globe, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";

import { User } from "@/types/user";
import { CartItem } from "@/types/cart";
import DailyOrderCheckComponent from "./order/DailyOrderCheck";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/format";
import { isDeviceCategory } from "@/lib/constants/delivery";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddressData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryType:
  | "istanbul-installation"
  | "domestic-cargo"
  | "international-cargo";
  onlineSupport: boolean;
  notes: string;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const t = useTranslations();
  const { cartItems, getTotalPrice, clearCart, setToast } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "summary">("address");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Pre-fill form with user data
        setAddressData((prev) => ({
          ...prev,
          fullName: user.user_metadata?.full_name || "",
          email: user.email || "",
        }));
      }
    });
  }, []);

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

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("summary");
  };

  const generateWhatsAppMessage = () => {
    const deviceItems = cartItems.filter((item) =>
      isDeviceCategory(item.categoryId)
    );
    const maskAndAccessoryItems = cartItems.filter(
      (item) => !isDeviceCategory(item.categoryId)
    );

    let message = `🏥 *OtoCPAP Sipariş Detayları*\n\n`;

    // Müşteri Bilgileri
    message += `👤 *Müşteri Bilgileri:*\n`;
    message += `Ad Soyad: ${addressData.fullName}\n`;
    message += `Telefon: ${addressData.phone}\n`;
    message += `E-posta: ${addressData.email}\n\n`;

    // Adres Bilgileri
    message += `📍 *Teslimat Adresi:*\n`;
    message += `${addressData.address}\n`;
    message += `${addressData.district}, ${addressData.city}\n`;
    message += `Posta Kodu: ${addressData.postalCode}\n`;
    message += `Ülke: ${addressData.country}\n\n`;

    // Teslimat Türü
    message += `🚚 *Teslimat Türü:*\n`;
    switch (addressData.deliveryType) {
      case "istanbul-installation":
        message += `İstanbul İçi Yerinde Kurulum (Ücretsiz)\n`;
        break;
      case "domestic-cargo":
        message += `Türkiye İçi Kargo\n`;
        break;
      case "international-cargo":
        message += `Yurt Dışı Kargo\n`;
        break;
    }

    if (addressData.onlineSupport) {
      message += `💻 Online Destek: Evet\n`;
    }
    message += `\n`;

    // Sipariş Detayları
    message += `🛒 *Sipariş Detayları:*\n\n`;

    if (deviceItems.length > 0) {
      message += `🔧 *Cihazlar:*\n`;
      deviceItems.forEach((item) => {
        message += `• ${item.product.name}\n`;
        message += `  Kategori: ${item.category}\n`;
        message += `  Adet: ${item.quantity}\n`;
        message += `  Fiyat: ${formatCurrency(item.product.price * item.quantity)}\n\n`;
      });
    }

    if (maskAndAccessoryItems.length > 0) {
      message += `🛠️ *Maskeler ve Aksesuarlar:*\n`;
      maskAndAccessoryItems.forEach((item) => {
        message += `• ${item.product.name}\n`;
        message += `  Kategori: ${item.category}\n`;
        message += `  Adet: ${item.quantity}\n`;
        message += `  Fiyat: ${formatCurrency(item.product.price * item.quantity)}\n\n`;
      });
    }

    // Toplam
    message += `💰 *TOPLAM: ${formatCurrency(getTotalPrice())}*\n\n`;

    // Notlar
    if (addressData.notes) {
      message += `📝 *Özel Notlar:*\n${addressData.notes}\n\n`;
    }

    message += `Bu sipariş OtoCPAP web sitesi üzerinden verilmiştir.`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = async () => {
    setLoading(true);

    try {
      // Kullanıcı kontrolü
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setToast({
          message: "Sipariş vermek için giriş yapmalısınız.",
          type: "warning",
        });
        setLoading(false);
        return;
      }

      // Sipariş ürünlerini JSON formatında hazırla
      const orderProducts = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: (item as any).price || 0,
        product_name: item.product.name,
        product_image: item.product.image1,
        product_brand: item.product.brand_id,
        product_category: item.product.category_id,
      }));

      // Prepare customer information as JSON object
      const customerInfo = {
        user_id: user.id,
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

      // Orders tablosuna kayıt için veri hazırla
      const orderData = {
        products: JSON.stringify(orderProducts), // JSON string olarak kaydet
        status_id: 1, // order_received durumu
        total: getTotalPrice(),
        currency: "TL",
        user: JSON.stringify(customerInfo), // Save customer info as JSON string
      };


      const { data: orderResult, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error("Sipariş kaydedilirken hata:", error);
        throw error;
      }



      // WhatsApp mesajını oluştur ve gönder
      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/905532808273?text=${message}`;

      // Yeni sekmede WhatsApp'ı aç
      window.open(whatsappUrl, "_blank");

      // Sepeti temizle ve modal'ı kapat
      clearCart();
      onClose();

      setToast({
        message: `Siparişiniz kaydedildi (Sipariş #${orderResult.id}). WhatsApp üzerinden detaylar gönderildi.`,
        type: "success",
      });
    } catch (error) {
      console.error("Sipariş gönderilirken hata:", error);
      setToast({
        message:
          "Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === "address" ? t("checkout.deliveryInfo") : t("checkout.orderSummary")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Daily Order Check */}
          {user && (
            <DailyOrderCheckComponent
              userId={user.id}
              onOrderStatusChange={() => { }}
            />
          )}

          {step === "address" ? (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              {/* Kişisel Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("checkout.personalInfo")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.fullName")} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.phone")} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.email")} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addressData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("checkout.addressInfo")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.address")} *
                    </label>
                    <textarea
                      name="address"
                      value={addressData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("checkout.district")} *
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={addressData.district}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("checkout.city")} *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("checkout.postalCode")}
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={addressData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.country")} *
                    </label>
                    <select
                      name="country"
                      value={addressData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Türkiye">{t('country.turkey')}</option>
                      <option value="Almanya">{t('country.germany')}</option>
                      <option value="Hollanda">{t('country.netherlands')}</option>
                      <option value="Belçika">{t('country.belgium')}</option>
                      <option value="Fransa">{t('country.france')}</option>
                      <option value="Diğer">{t('country.other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Teslimat Seçenekleri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("checkout.deliveryOptions")}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="istanbul-installation"
                      checked={
                        addressData.deliveryType === "istanbul-installation"
                      }
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MapPin size={20} className="text-blue-600" />
                        <span className="font-medium">
                          {t("checkout.istanbulInstallation")}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ({t('common.free')})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("checkout.istanbulInstallationDescription")}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="domestic-cargo"
                      checked={addressData.deliveryType === "domestic-cargo"}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Truck size={20} className="text-orange-600" />
                        <span className="font-medium">
                          {t("checkout.domesticCargo")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("checkout.domesticCargoDescription")}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="international-cargo"
                      checked={
                        addressData.deliveryType === "international-cargo"
                      }
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe size={20} className="text-purple-600" />
                        <span className="font-medium">
                          {t("checkout.internationalCargo")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("checkout.internationalCargoDescription")}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Online Destek */}
                <div className="mt-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="onlineSupport"
                      checked={addressData.onlineSupport}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="font-medium">{t("checkout.onlineSupport")}</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    {t("checkout.onlineSupportDescription")}
                  </p>
                </div>
              </div>

              {/* Özel Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("checkout.specialNotes")}
                </label>
                <textarea
                  name="notes"
                  value={addressData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("checkout.specialNotesPlaceholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("checkout.continue")}
              </button>
            </form>
          ) : (
            /* Sipariş Özeti */
            <div className="space-y-6">
              {/* Teslimat Bilgileri Özeti */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t("checkout.deliveryInfo")}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>{t("checkout.fullName")}:</strong> {addressData.fullName}
                  </p>
                  <p>
                    <strong>{t("checkout.phone")}:</strong> {addressData.phone}
                  </p>
                  <p>
                    <strong>{t("checkout.address")}:</strong> {addressData.address},{" "}
                    {addressData.district}, {addressData.city}
                  </p>
                  <p>
                    <strong>{t("checkout.delivery")}</strong>
                    {addressData.deliveryType === "istanbul-installation" &&
                      " " + t("checkout.istanbulInstallation")}
                    {addressData.deliveryType === "domestic-cargo" &&
                      " " + t("checkout.domesticCargo")}
                    {addressData.deliveryType === "international-cargo" &&
                      " " + t("checkout.internationalCargo")}
                  </p>
                  {addressData.onlineSupport && (
                    <p>
                      <strong>{t("checkout.onlineSupport")}:</strong> {t('common.yes')}
                    </p>
                  )}
                </div>
              </div>

              {/* Sipariş Detayları */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t("checkout.orderDetails")}
                </h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-gray-200"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {t("checkout.quantity")}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                  <span className="text-lg font-bold">{t("checkout.total")}:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex flex-col lg:flex-row gap-4">
                <button
                  onClick={() => setStep("address")}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 m-0 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t("checkout.goBack")}
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("checkout.sending")}
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} className="mr-2" />
                      {t("checkout.orderWithWhatsApp")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
