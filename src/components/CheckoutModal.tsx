'use client';

import { useState } from 'react';
import { X, MapPin, Truck, Globe, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

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
  deliveryType: 'istanbul-installation' | 'domestic-cargo' | 'international-cargo';
  onlineSupport: boolean;
  notes: string;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'summary'>('address');
  
  const [addressData, setAddressData] = useState<AddressData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    country: 'Türkiye',
    deliveryType: 'istanbul-installation',
    onlineSupport: false,
    notes: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('summary');
  };

  const generateWhatsAppMessage = () => {
    const deviceCategoryIds = [1, 3, 5, 7, 8, 9, 10, 11, 13, 14];
    const deviceItems = cartItems.filter(item => deviceCategoryIds.includes(item.categoryId));
    const maskAndAccessoryItems = cartItems.filter(item => !deviceCategoryIds.includes(item.categoryId));

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
      case 'istanbul-installation':
        message += `İstanbul İçi Yerinde Kurulum (Ücretsiz)\n`;
        break;
      case 'domestic-cargo':
        message += `Türkiye İçi Kargo\n`;
        break;
      case 'international-cargo':
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
      deviceItems.forEach(item => {
        message += `• ${item.product.name}\n`;
        message += `  Kategori: ${item.category}\n`;
        message += `  Adet: ${item.quantity}\n`;
        message += `  Fiyat: ₺${(item.product.price * item.quantity).toLocaleString('tr-TR')}\n\n`;
      });
    }

    if (maskAndAccessoryItems.length > 0) {
      message += `🛠️ *Maskeler ve Aksesuarlar:*\n`;
      maskAndAccessoryItems.forEach(item => {
        message += `• ${item.product.name}\n`;
        message += `  Kategori: ${item.category}\n`;
        message += `  Adet: ${item.quantity}\n`;
        message += `  Fiyat: ₺${(item.product.price * item.quantity).toLocaleString('tr-TR')}\n\n`;
      });
    }

    // Toplam
    message += `💰 *TOPLAM: ₺${getTotalPrice().toLocaleString('tr-TR')}*\n\n`;

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Sipariş vermek için giriş yapmalısınız.');
        setLoading(false);
        return;
      }

      // Siparişi veritabanına kaydet
      const orderData = {
        user: user.id,
        products: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          category: item.category
        })),
        total: getTotalPrice(),
        currency: 'TRY',
        status: 'whatsapp-sent',
        delivery_info: {
          ...addressData,
          delivery_type: addressData.deliveryType,
          online_support: addressData.onlineSupport
        }
      };

      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) {
        console.error('Sipariş kaydedilirken hata:', error);
        // Hata olsa bile WhatsApp'a yönlendir
      }

      // WhatsApp mesajını oluştur ve gönder
      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/905532808273?text=${message}`;
      
      // Yeni sekmede WhatsApp'ı aç
      window.open(whatsappUrl, '_blank');
      
      // Sepeti temizle ve modal'ı kapat
      clearCart();
      onClose();
      
      alert('Siparişiniz WhatsApp üzerinden gönderildi. En kısa sürede size dönüş yapacağız.');
      
    } catch (error) {
      console.error('Sipariş gönderilirken hata:', error);
      alert('Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            {step === 'address' ? 'Teslimat Bilgileri' : 'Sipariş Özeti'}
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
          {step === 'address' ? (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              {/* Kişisel Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
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
                      Telefon *
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
                      E-posta *
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres *
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
                        İlçe *
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
                        İl *
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
                        Posta Kodu
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
                      Ülke *
                    </label>
                    <select
                      name="country"
                      value={addressData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Türkiye">Türkiye</option>
                      <option value="Almanya">Almanya</option>
                      <option value="Hollanda">Hollanda</option>
                      <option value="Belçika">Belçika</option>
                      <option value="Fransa">Fransa</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Teslimat Seçenekleri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Seçenekleri</h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="istanbul-installation"
                      checked={addressData.deliveryType === 'istanbul-installation'}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MapPin size={20} className="text-blue-600" />
                        <span className="font-medium">İstanbul İçi Yerinde Kurulum</span>
                        <span className="text-green-600 font-semibold">(Ücretsiz)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Cihazınız uzman teknisyenimiz tarafından evinizde kurulur ve eğitim verilir.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="domestic-cargo"
                      checked={addressData.deliveryType === 'domestic-cargo'}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Truck size={20} className="text-orange-600" />
                        <span className="font-medium">Türkiye İçi Kargo</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Cihazınız kargo ile adresinize gönderilir. Kurulum videoları ve telefon desteği sağlanır.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="international-cargo"
                      checked={addressData.deliveryType === 'international-cargo'}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe size={20} className="text-purple-600" />
                        <span className="font-medium">Yurt Dışı Kargo</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Cihazınız uluslararası kargo ile gönderilir. Online destek sağlanır.
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
                    <span className="font-medium">Online Destek İstiyorum</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Video konferans ile kurulum desteği ve kullanım eğitimi
                  </p>
                </div>
              </div>

              {/* Özel Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Notlar
                </label>
                <textarea
                  name="notes"
                  value={addressData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Siparişinizle ilgili özel notlarınız..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Devam Et
              </button>
            </form>
          ) : (
            /* Sipariş Özeti */
            <div className="space-y-6">
              {/* Teslimat Bilgileri Özeti */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Teslimat Bilgileri</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Ad Soyad:</strong> {addressData.fullName}</p>
                  <p><strong>Telefon:</strong> {addressData.phone}</p>
                  <p><strong>Adres:</strong> {addressData.address}, {addressData.district}, {addressData.city}</p>
                  <p><strong>Teslimat:</strong> 
                    {addressData.deliveryType === 'istanbul-installation' && ' İstanbul İçi Yerinde Kurulum'}
                    {addressData.deliveryType === 'domestic-cargo' && ' Türkiye İçi Kargo'}
                    {addressData.deliveryType === 'international-cargo' && ' Yurt Dışı Kargo'}
                  </p>
                  {addressData.onlineSupport && <p><strong>Online Destek:</strong> Evet</p>}
                </div>
              </div>

              {/* Sipariş Detayları */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sipariş Detayları</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₺{(item.product.price * item.quantity).toLocaleString('tr-TR')}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                  <span className="text-lg font-bold">Toplam:</span>
                  <span className="text-lg font-bold text-blue-600">₺{getTotalPrice().toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('address')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Geri Dön
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} className="mr-2" />
                      WhatsApp ile Sipariş Ver
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