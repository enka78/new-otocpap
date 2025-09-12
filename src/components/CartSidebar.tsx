"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { supabase, getProductImageUrl } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import CheckoutModal from "./CheckoutModal";
import { DailyOrderCheck } from "@/lib/orderValidation";

// interface CartItem {
//   id: number;
//   product: Product;
//   quantity: number;
//   category: string;
// }

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const t = useTranslations();
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderCheck, setOrderCheck] = useState<DailyOrderCheck | null>(null);

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    setToast,
  } = useCart();

  useEffect(() => {
    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const getCategoryName = (categoryId: number) => {
    const item = cartItems.find(
      (item) => item.product.category_id === categoryId
    );
    return item?.category || t('products.categoryLabel');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {t("cart.title")}
            </h2>
            {cartItems.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("cart.emptyTitle")}
              </h3>
              <p className="text-gray-500 mb-6">{t("cart.emptyDescription")}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {t("cart.startShopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-lg flex-shrink-0">
                      <Image
                        src={getProductImageUrl(item.product.image1 || "")}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {getCategoryName(item.product.category_id)}
                      </p>

                      {/* Price */}
                      {user ? (
                        <div className="text-sm font-bold text-blue-600">
                          ₺
                          {(item.product.price * item.quantity).toLocaleString(
                            "tr-TR"
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {t("cart.loginToSeePrice")}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {![1, 3, 5, 7, 8, 9, 10, 11, 13, 14].includes(
                      item.categoryId
                    ) && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        {/* Plus butonu sadece maske ve aksesuar için aktif */}
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className={`w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full transition-colors hover:bg-gray-50 cursor-pointer`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}

                    <div className="text-right flex justify-end w-full">
                      {![1, 3, 5, 7, 8, 9, 10, 11, 13, 14].includes(
                        item.categoryId
                      ) &&
                        user && (
                          <div className="text-sm text-gray-600">
                            {t('cart.unitPrice')} ₺{item.product.price.toLocaleString("tr-TR")}
                          </div>
                        )}
                      {/* Cihaz için uyarı */}
                      {[1, 3, 5, 7, 8, 9, 10, 11, 13, 14].includes(
                        item.categoryId
                      ) && (
                        <div className="text-xs text-orange-600 mt-1">
                          {t('cart.deviceLimit')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Total */}
            {user && (
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t("cart.total")}</span>
                <span className="text-blue-600">
                  ₺{getTotalPrice().toLocaleString("tr-TR")}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 flex-col md:flex-row">
              <button
                onClick={clearCart}
                className="w-full  bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("cart.clearCart")}
              </button>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => {
                  if (!user) {
                    setToast({
                      message: t("cart.loginToOrder"),
                      type: "warning",
                    });
                    return;
                  }
                  console.log("orderCheck", orderCheck);
                  if (orderCheck !== null) {
                    setToast({
                      message: t("cart.dailyOrderLimit"),
                      type: "warning",
                    });
                    return;
                  }
                  setIsCheckoutOpen(true);
                }}
              >
                {t("cart.placeOrder")} ({getTotalItems()} {t('cart.items')})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
