"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { cancelOrder } from '@/lib/orderValidation';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  XCircle, 
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';
import { fetchOrderStatuses, getOrderStatus, canCancelOrder, getStatusColor, getStatusIcon } from '@/lib/orderStatus';

interface Order {
  id: number;
  order_number?: string;
  status_id: number;
  created_at: string;
  total: number;
  products: string; // JSON string
  user: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  delivery_notes?: string | null;
  product_details?: OrderProductDetail[];
  status?: {
    id: number;
    name: string;
    display_name: string;
    description: string;
    color: string;
    icon: string;
  };
}

interface OrderProduct {
  product_id: number;
  quantity: number;
  price: number;
  name?: string;
}

interface OrderProductDetail {
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    category: string;
  } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    checkAuthAndFetchOrders();
    // Status cache'ini yükle
    fetchOrderStatuses();
  }, []);

  const checkAuthAndFetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      setUser(user);
      await fetchOrders(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    try {
      // Use API endpoint to get enriched order data
      const response = await fetch(`/api/orders?user_id=${userId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      // Map API response to match our Order interface
      const mappedOrders = result.orders.map((order: any) => ({
        ...order,
        status: order.status ? {
          id: order.status.id,
          name: order.status.name,
          display_name: order.status.display_name,
          description: order.status.description,
          color: getStatusColor(order.status.name),
          icon: getStatusIcon(order.status.name)
        } : null
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {

    console.log('Cancelling order:', orderId);
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) return;

    setCancelling(orderId);
    try {
      const result = await cancelOrder(orderId, user.id);
      
      if (result.success) {
        await fetchOrders(user.id);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Sipariş iptal edilirken bir hata oluştu.');
    } finally {
      setCancelling(null);
    }
  };

  const getOrderStatusIcon = (order: Order) => {
    const iconName = order.status?.icon || 'clock';
    switch (iconName) {
      case 'clock': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'package': return <Package className="w-5 h-5 text-purple-500" />;
      case 'truck': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'calendar': return <Calendar className="w-5 h-5 text-indigo-500" />;
      case 'check-circle': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'x-circle': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOrderStatusText = (order: Order) => {
    return order.status?.display_name || 'Bilinmeyen Durum';
  };

  const getOrderStatusColor = (order: Order) => {
    const color = order.status?.color || '#6B7280';
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'bg-blue-100 text-blue-800',
      '#10B981': 'bg-green-100 text-green-800', 
      '#F59E0B': 'bg-yellow-100 text-yellow-800',
      '#EF4444': 'bg-red-100 text-red-800',
      '#8B5CF6': 'bg-purple-100 text-purple-800',
      '#F97316': 'bg-orange-100 text-orange-800',
      '#6366F1': 'bg-indigo-100 text-indigo-800',
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const parseOrderProducts = (productsJson: string): OrderProduct[] => {
    try {
      return JSON.parse(productsJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişlerim</h1>
            <p className="text-gray-600">Verdiğiniz siparişleri buradan takip edebilirsiniz.</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz siparişiniz yok
              </h3>
              <p className="text-gray-500 mb-6">
                İlk siparişinizi vermek için ürünlerimize göz atın.
              </p>
              <button
                onClick={() => router.push(`/${locale}/products`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ürünleri İncele
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-4">
                          Sipariş #{order.order_number || order.id}
                        </h3>
                        <div className="flex items-center">
                          {getOrderStatusIcon(order)}
                          <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(order)}`}>
                            {getOrderStatusText(order)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {order.total.toFixed(2)} ₺
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          {order.product_details?.length || parseOrderProducts(order.products).length} ürün
                          {order.product_details && order.product_details.length > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({order.product_details.map(item => item.product?.name).filter(Boolean).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={16} className="mr-1" />
                        Detaylar
                      </button>
                      
                      {canCancelOrder(order.status?.name || '') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle size={16} className="mr-1" />
                          {cancelling === order.id ? 'İptal Ediliyor...' : 'İptal Et'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Sipariş Detayları - #{selectedOrder.order_number || selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  {getOrderStatusIcon(selectedOrder)}
                  <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(selectedOrder)}`}>
                    {getOrderStatusText(selectedOrder)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{selectedOrder.status?.description || 'Sipariş durumu açıklaması'}</p>
                
                {/* Teslimat Randevusu Bilgisi */}
                {selectedOrder.status?.name === 'appointment_scheduled' && (selectedOrder.delivery_date || selectedOrder.delivery_time) && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Teslimat Randevusu
                    </h4>
                    {selectedOrder.delivery_date && (
                      <p className="text-sm text-indigo-800">
                        <strong>Tarih:</strong> {new Date(selectedOrder.delivery_date).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                    {selectedOrder.delivery_time && (
                      <p className="text-sm text-indigo-800">
                        <strong>Saat:</strong> {selectedOrder.delivery_time}
                      </p>
                    )}
                    {selectedOrder.delivery_notes && (
                      <p className="text-sm text-indigo-800 mt-2">
                        <strong>Not:</strong> {selectedOrder.delivery_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Products */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sipariş Ürünleri</h3>
                <div className="space-y-3">
                  {selectedOrder.product_details && selectedOrder.product_details.length > 0 ? (
                    selectedOrder.product_details.map((item, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        {item.product?.image_url && (
                          <div className="w-16 h-16 mr-4 flex-shrink-0">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product?.name || `Ürün ID: ${item.product_id}`}
                          </h4>
                          {item.product?.brand && (
                            <p className="text-sm text-gray-600">Marka: {item.product.brand}</p>
                          )}
                          {item.product?.category && (
                            <p className="text-sm text-gray-600">Kategori: {item.product.category}</p>
                          )}
                          <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        </div>
                        
                        {/* Price Info */}
                        <div className="text-right">
                          <p className="font-medium text-lg">{(item.price * item.quantity).toFixed(2)} ₺</p>
                          <p className="text-sm text-gray-600">{item.price.toFixed(2)} ₺/adet</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    parseOrderProducts(selectedOrder.products).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Ürün ID: {item.product_id}</p>
                          <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(item.price * item.quantity).toFixed(2)} ₺</p>
                          <p className="text-sm text-gray-600">{item.price.toFixed(2)} ₺/adet</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Toplam Tutar:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {selectedOrder.total.toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}