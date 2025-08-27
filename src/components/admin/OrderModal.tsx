"use client";

import { Order, OrderProduct } from "@/types/order";
import { Product } from "@/types/product";

import { OrderStatus } from "@/types/order";
import {
  X,
  Package,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface OrderModalProps {
  order: Order;
  products: Product[];
  statuses: OrderStatus[];
  onClose: () => void;
}

export default function OrderModal({
  order,
  products,
  statuses,
  onClose,
}: OrderModalProps) {
  const parseOrderProducts = (productsJson: string) => {
    try {
      return JSON.parse(productsJson);
    } catch {
      return [];
    }
  };

  const getProduct = (productId: number) => {
    return products.find((p) => Number(p.id) === productId);
  };

  const orderProducts = parseOrderProducts(order.products);
  const orderDate = new Date(order.created_at);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sipariş #{order.id}
              </h2>
              <p className="text-gray-600">
                {orderDate.toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sipariş Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Sipariş No:</span>
                      <span className="ml-2 font-medium">#{order.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Tarih:</span>
                      <span className="ml-2 font-medium">
                        {orderDate.toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Toplam:</span>
                      <span className="ml-2 font-medium text-lg">
                        {order.total.toLocaleString()} {order.currency}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: order.status?.color || "#6B7280",
                        }}
                      ></div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className="ml-2 font-medium">
                        {order.status?.display_name || "Bilinmiyor"}
                      </span>
                    </div>
                  </div>
                  {order.appointment_date && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm text-gray-600">Randevu:</span>
                        <span className="ml-2 font-medium">
                          {new Date(order.appointment_date).toLocaleDateString(
                            "tr-TR"
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Müşteri Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">
                        Kullanıcı ID:
                      </span>
                      <span className="ml-2 font-medium font-mono text-sm">
                        {order.user}
                      </span>
                    </div>
                  </div>
                  {/* Burada gerçek müşteri bilgileri auth.users tablosundan çekilebilir */}
                </div>
              </div>
            </div>

            {/* Right Column - Products */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Edilen Ürünler
              </h3>
              <div className="space-y-4">
                {orderProducts.map((item: OrderProduct, index: number) => {
                  const product = getProduct(item.product_id);
                  const itemTotal = item.quantity * item.price;

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {product?.name || `Ürün #${item.product_id}`}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Birim Fiyat:
                              </span>
                              <span className="font-medium">
                                {item.price.toLocaleString()} {order.currency}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Adet:</span>
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-t pt-1">
                              <span>Toplam:</span>
                              <span>
                                {itemTotal.toLocaleString()} {order.currency}
                              </span>
                            </div>
                          </div>
                        </div>
                        {product?.image1 && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products-images/${product.image1}`}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Genel Toplam:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {order.total.toLocaleString()} {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yazdır
          </button>
        </div>
      </div>
    </div>
  );
}
