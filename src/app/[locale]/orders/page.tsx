"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, handleAuthError, clearAuthState, hasValidSession } from "@/lib/supabase";
import {
  Package,
  Calendar,
  DollarSign,
  XCircle,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";
import {
  fetchOrderStatuses,
  getOrderStatus,
  canCancelOrder,
  getStatusColor,
  getStatusIcon,
} from "@/lib/orderStatus";

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
  product_name?: string;
  product_image?: string;
  product_brand?: string;
  product_category?: string;
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
      // First check if we have any valid session
      const hasSession = await hasValidSession();
      if (!hasSession) {
        console.log('No valid session found, redirecting to home');
        clearAuthState();
        router.push(`/${locale}`);
        return;
      }

      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth error in checkAuthAndFetchOrders:', error);
        await handleAuthError(error);
        router.push(`/${locale}`);
        return;
      }

      if (!user) {
        console.log('No user found, redirecting to home');
        router.push(`/${locale}`);
        return;
      }

      setUser(user);
      await fetchOrders(user.id);
    } catch (error: any) {
      console.error('Error checking auth:', error);
      await handleAuthError(error);
      router.push(`/${locale}`);
    }
  };

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    try {
      // Use API endpoint to get enriched order data
      const response = await fetch(`/api/orders?user_id=${userId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch orders");
      }

      // Fetch brands and categories data with error handling
      const [brandsResponse, categoriesResponse] = await Promise.all([
        supabase.from('brands').select('id, name').then(response => {
          if (response.error) {
            console.error('Error fetching brands:', response.error);
            return { data: [], error: response.error };
          }
          return response;
        }),
        supabase.from('categories').select('id, name').then(response => {
          if (response.error) {
            console.error('Error fetching categories:', response.error);
            return { data: [], error: response.error };
          }
          return response;
        })
      ]);

      const brands = brandsResponse.data || [];
      const categories = categoriesResponse.data || [];

      // Create lookup maps for performance
      const brandMap = new Map(brands.map(brand => [brand.id, brand.name]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));

      // Parse the `products` field from JSON and enrich orders
      const enrichedOrders = result.orders.map((order: any) => ({
        ...order,
        product_details: JSON.parse(order.products).map((product: any) => ({
          ...product,
          product_image: `https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/products-images/${product.product_image}`,
          // Convert brand_id to brand name
          product_brand: product.product_brand ? brandMap.get(product.product_brand) || t('products.unknown') : undefined,
          // Convert category_id to category name
          product_category: product.product_category ? categoryMap.get(product.product_category) || t('products.unknown') : undefined,
        })),
      }));

      setOrders(enrichedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      // Handle auth errors specifically
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found')) {
        await handleAuthError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusIcon = (order: Order) => {
    const iconName = order.status?.icon || "clock";
    switch (iconName) {
      case "clock":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "package":
        return <Package className="w-5 h-5 text-purple-500" />;
      case "truck":
        return <Truck className="w-5 h-5 text-orange-500" />;
      case "calendar":
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case "check-circle":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "x-circle":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOrderStatusText = (order: Order) => {
    return order.status?.display_name || t('common.unknown');
  };

  const getOrderStatusColor = (order: Order) => {
    const color = order.status?.color || "#6B7280";
    const colorMap: { [key: string]: string } = {
      "#3B82F6": "bg-blue-100 text-blue-800",
      "#10B981": "bg-green-100 text-green-800",
      "#F59E0B": "bg-yellow-100 text-yellow-800",
      "#EF4444": "bg-red-100 text-red-800",
      "#8B5CF6": "bg-purple-100 text-purple-800",
      "#F97316": "bg-orange-100 text-orange-800",
      "#6366F1": "bg-indigo-100 text-indigo-800",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const parseOrderProducts = (productsJson: string): OrderProduct[] => {
    try {
      return JSON.parse(productsJson);
    } catch {
      return [];
    }
  };

  // Helper function to parse user info from JSON
  const parseUserInfo = (userField: string | any) => {
    try {
      if (typeof userField === 'string') {
        return JSON.parse(userField);
      }
      return userField;
    } catch {
      return {
        user_id: userField,
        name: 'Unknown',
        email: 'Unknown',
        address: 'Not specified'
      };
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("orders.title")}
                </h1>
                <p className="text-gray-600">{t("orders.description")}</p>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {orders.length} {t("orders.totalOrders")}
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("orders.noOrdersTitle")}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {t("orders.noOrdersDescription")}
              </p>
              <button
                onClick={() => router.push(`/${locale}/products`)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("orders.viewProducts")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {getOrderStatusIcon(order)}
                          <span
                            className={`ml-3 px-4 py-2 text-sm font-medium rounded-full ${getOrderStatusColor(
                              order
                            )}`}
                          >
                            {getOrderStatusText(order)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(order.created_at).toLocaleDateString("tr-TR")}
                        </div>
                        <div className="flex items-center font-semibold text-blue-600">
                          {order.total.toFixed(2)} ₺
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t("orders.viewDetails")}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Products Summary */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {t("orders.orderProducts")}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {order.product_details?.length || 0} {t("common.items")}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.product_details?.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-gray-50 rounded-lg border"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 flex-shrink-0 mr-4">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name || t("products.unknown")}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name || t("products.unknown")}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.product_brand && (
                                <span>{item.product_brand} • </span>
                              )}
                              {t("checkout.quantity")}: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 mt-1">
                              {(item.price * item.quantity).toFixed(2)} ₺
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {order.product_details && order.product_details.length > 3 && (
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <div className="text-center">
                            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              +{order.product_details.length - 3} {t("common.moreItems")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {t("orders.customerInfo")}
                      </h5>
                      <div className="text-sm text-blue-700 space-y-2">
                        {(() => {
                          const userInfo = parseUserInfo(order.user);
                          return (
                            <>
                              <div>
                                <span className="font-medium">{userInfo.name || 'Unknown'}</span>
                              </div>
                              {userInfo.address && (
                                <div className="flex items-start">
                                  <strong className="flex-shrink-0">Teslimat Adresi:</strong>
                                  <span className="flex-1 ml-2">
                                    {userInfo.address}
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.delivery_date && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              {t("orders.deliveryScheduled")}
                            </p>
                            <p className="text-sm text-blue-700">
                              {new Date(order.delivery_date).toLocaleDateString("tr-TR")}
                              {order.delivery_time && ` • ${order.delivery_time}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("orders.orderDetails")}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Status & Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Status */}
                  <div className="flex items-center space-x-3">
                    {getOrderStatusIcon(selectedOrder)}
                    <div>
                      <p className="text-sm text-gray-600">{t("orders.status")}</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(
                          selectedOrder
                        )}`}
                      >
                        {getOrderStatusText(selectedOrder)}
                      </span>
                    </div>
                  </div>

                  {/* Order Date */}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t("orders.orderDate")}</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">₺</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t("orders.totalAmount")}</p>
                      <p className="font-bold text-blue-600 text-lg">
                        {selectedOrder.total.toFixed(2)} ₺
                      </p>
                    </div>
                  </div>

                  {/* Items Count */}
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t("common.items")}</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.product_details?.length || 0} {t("common.items")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Description */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600">
                    {selectedOrder.status?.description || t('orders.statusDescription')}
                  </p>
                </div>

                {/* Customer Information */}
                <div className="mt-6 p-6 bg-white rounded-xl border">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {t("orders.customerInfo")}
                  </h4>
                  <div className="space-y-4">
                    {(() => {
                      const userInfo = parseUserInfo(selectedOrder.user);
                      return (
                        <>
                          <div>
                            <p className="text-gray-900 font-medium">{userInfo.name || 'Unknown'}</p>
                          </div>
                          {userInfo.address && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Teslimat Adresi:</p>
                              <div className="text-gray-900">
                                <p className="whitespace-pre-line">{userInfo.address}</p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Delivery Appointment */}
                {selectedOrder.status?.name === "appointment_scheduled" &&
                  (selectedOrder.delivery_date || selectedOrder.delivery_time) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t("orders.deliveryAppointment")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedOrder.delivery_date && (
                          <div>
                            <p className="font-medium text-blue-900">{t("orders.deliveryDate")}:</p>
                            <p className="text-blue-700">
                              {new Date(selectedOrder.delivery_date).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                        )}
                        {selectedOrder.delivery_time && (
                          <div>
                            <p className="font-medium text-blue-900">{t("orders.deliveryTime")}:</p>
                            <p className="text-blue-700">{selectedOrder.delivery_time}</p>
                          </div>
                        )}
                      </div>
                      {selectedOrder.delivery_notes && (
                        <div className="mt-3">
                          <p className="font-medium text-blue-900">{t("orders.deliveryNotes")}:</p>
                          <p className="text-blue-700">{selectedOrder.delivery_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Order Products */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {t("orders.orderProducts")}
                </h3>
                <div className="space-y-4">
                  {selectedOrder.product_details &&
                  selectedOrder.product_details.length > 0
                    ? selectedOrder.product_details.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-6 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors"
                        >
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 mr-6">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name || t("products.unknown")}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-2">
                              {item.product_name || `${t('products.unknown')} ID: ${item.product_id}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              {item.product_brand && (
                                <div>
                                   {item.product_brand}
                                </div>
                              )}
                              {item.product_category && (
                                <div>
                                  {item.product_category}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">{t("checkout.quantity")}:</span> {item.quantity}
                              </div>
                            </div>
                          </div>

                          {/* Price Info */}
                          <div className="text-right ml-6">
                            <p className="font-bold text-xl text-blue-600 mb-1">
                              {(item.price * item.quantity).toFixed(2)} ₺
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.price.toFixed(2)} ₺/{t("common.unit")}
                            </p>
                          </div>
                        </div>
                      ))
                    : parseOrderProducts(selectedOrder.products).map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-6 bg-gray-50 rounded-xl border"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {t('products.unknown')} ID: {item.product_id}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {t("checkout.quantity")}: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xl text-blue-600">
                                {(item.price * item.quantity).toFixed(2)} ₺
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.price.toFixed(2)} ₺/{t("common.unit")}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {t("orders.totalAmount")}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedOrder.total.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}