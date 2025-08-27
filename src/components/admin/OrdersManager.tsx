"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingCart,
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Edit,
} from "lucide-react";
import { fetchOrderStatuses, getOrderStatus, getStatusColor, getStatusIcon } from '@/lib/orderStatus';

interface Order {
  id: number;
  order_number?: string;
  status_id: number;
  total: number;
  created_at: string;
  user: string;
  products: string; // JSON string
  order_items?: OrderItem[];
  delivery_date?: string | null;
  delivery_time?: string | null;
  delivery_notes?: string | null;
  status?: {
    id: number;
    name: string;
    display_name: string;
    description: string;
    color: string;
    icon: string;
  };
}

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Order | null>(null);
  const [deliveryData, setDeliveryData] = useState({
    delivery_date: '',
    delivery_time: '',
    delivery_notes: ''
  });
  const [allStatuses, setAllStatuses] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    const statuses = await fetchOrderStatuses();
    setAllStatuses(statuses);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          status:status_id (
            id,
            name,
            display_name,
            description,
            color,
            icon
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Orders tablosundaki products JSON'ını parse et
      const ordersWithParsedProducts = (data || []).map((order: any) => ({
        ...order,
        order_items: order.products ? JSON.parse(order.products) : []
      }));
      
      setOrders(ordersWithParsedProducts as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatusId: number) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status_id: newStatusId })
        .eq("id", orderId);

      if (error) throw error;

      // Yeni status bilgisini bul
      const newStatus = allStatuses.find(s => s.id === newStatusId);
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status_id: newStatusId, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Sipariş durumu güncellenirken bir hata oluştu.");
    }
  };

  const updateDeliveryInfo = async () => {
    if (!editingDelivery) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          delivery_date: deliveryData.delivery_date || null,
          delivery_time: deliveryData.delivery_time || null,
          delivery_notes: deliveryData.delivery_notes || null,
          status_id: deliveryData.delivery_date ? 4 : editingDelivery.status_id // 4 = appointment_scheduled
        })
        .eq("id", editingDelivery.id);

      if (error) throw error;

      const newStatus = deliveryData.delivery_date ? allStatuses.find(s => s.id === 4) : null;
      
      setOrders(orders.map(order => 
        order.id === editingDelivery.id 
          ? { 
              ...order, 
              delivery_date: deliveryData.delivery_date || null,
              delivery_time: deliveryData.delivery_time || null,
              delivery_notes: deliveryData.delivery_notes || null,
              status_id: deliveryData.delivery_date ? 4 : order.status_id,
              status: newStatus || order.status
            } 
          : order
      ));

      setEditingDelivery(null);
      setDeliveryData({ delivery_date: '', delivery_time: '', delivery_notes: '' });
      alert('Teslimat bilgileri güncellendi.');
    } catch (error) {
      console.error("Error updating delivery info:", error);
      alert("Teslimat bilgileri güncellenirken bir hata oluştu.");
    }
  };

  const openDeliveryModal = (order: Order) => {
    setEditingDelivery(order);
    setDeliveryData({
      delivery_date: order.delivery_date || '',
      delivery_time: order.delivery_time || '',
      delivery_notes: order.delivery_notes || ''
    });
  };

  const getOrderStatusIcon = (order: Order) => {
    const iconName = order.status?.icon || 'clock';
    switch (iconName) {
      case 'clock': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'package': return <Package className="w-4 h-4 text-purple-500" />;
      case 'truck': return <Truck className="w-4 h-4 text-orange-500" />;
      case 'calendar': return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'check-circle': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'x-circle': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number || order.id.toString()).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status?.name === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="text-gray-600">Toplam {filteredOrders.length} sipariş</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Sipariş numarası, müşteri adı veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              {allStatuses.map((status) => (
                <option key={status.id} value={status.name}>{status.display_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.order_number || order.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.order_items?.length || 0} ürün
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Kullanıcı ID: {order.user}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getOrderStatusIcon(order)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order)}`}>
                        {getOrderStatusText(order)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      {order.total.toFixed(2)} ₺
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {new Date(order.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Detayları Görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openDeliveryModal(order)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Teslimat Randevusu"
                      >
                        <Edit size={16} />
                      </button>
                      <select
                        value={order.status_id}
                        onChange={(e) => updateOrderStatus(order.id, parseInt(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                      >
                        {allStatuses.map((status) => (
                          <option key={status.id} value={status.id}>{status.display_name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Sipariş bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Arama kriterlerinize uygun sipariş bulunamadı.
          </p>
        </div>
      )}

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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sipariş Durumu</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {getOrderStatusIcon(selectedOrder)}
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(selectedOrder)}`}>
                      {getOrderStatusText(selectedOrder)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedOrder.status?.description || 'Sipariş durumu açıklaması'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Müşteri Bilgileri</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Kullanıcı ID:</strong> {selectedOrder.user}</p>
                </div>
              </div>

              {/* Delivery Info */}
              {(selectedOrder.delivery_date || selectedOrder.delivery_time || selectedOrder.delivery_notes) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Teslimat Bilgileri</h3>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    {selectedOrder.delivery_date && (
                      <p className="text-sm text-indigo-800 mb-1">
                        <strong>Tarih:</strong> {new Date(selectedOrder.delivery_date).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                    {selectedOrder.delivery_time && (
                      <p className="text-sm text-indigo-800 mb-1">
                        <strong>Saat:</strong> {selectedOrder.delivery_time}
                      </p>
                    )}
                    {selectedOrder.delivery_notes && (
                      <p className="text-sm text-indigo-800">
                        <strong>Not:</strong> {selectedOrder.delivery_notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sipariş Ürünleri</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item, index) => (
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
                  ))}
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

      {/* Delivery Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Teslimat Randevusu - #{editingDelivery.order_number || editingDelivery.id}
                </h2>
                <button
                  onClick={() => setEditingDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Tarihi
                  </label>
                  <input
                    type="date"
                    value={deliveryData.delivery_date}
                    onChange={(e) => setDeliveryData({...deliveryData, delivery_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Saati
                  </label>
                  <input
                    type="time"
                    value={deliveryData.delivery_time}
                    onChange={(e) => setDeliveryData({...deliveryData, delivery_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Notu
                  </label>
                  <textarea
                    value={deliveryData.delivery_notes}
                    onChange={(e) => setDeliveryData({...deliveryData, delivery_notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Teslimat ile ilgili özel notlar..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingDelivery(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={updateDeliveryInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}