"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Product, supabase } from "@/lib/supabase";
import { getDeliverySettings } from "@/lib/services/settings";
import { DeliverySettings } from "@/types/settings";
import {
  DEFAULT_DOMESTIC_CARGO_FEE,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants/delivery";

// ... other imports

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  category: string;
  categoryId: number;
}

interface ToastMessage {
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product & { categories?: { name: string } },
    quantity?: number
  ) => boolean;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingCost: (deliveryType?: string) => number;
  getFinalTotal: (deliveryType?: string) => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: () => Promise<boolean>;
  toast: ToastMessage | null;
  setToast: (toast: ToastMessage | null) => void;
  deliverySettings: DeliverySettings;
}

const FALLBACK_DELIVERY_SETTINGS: DeliverySettings = {
  domesticCargoFee: DEFAULT_DOMESTIC_CARGO_FEE,
  freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(
    FALLBACK_DELIVERY_SETTINGS
  );

  // Kargo ayarlarını Supabase settings tablosundan yükle.
  // İki katmanlı yenileme stratejisi:
  // 1. Supabase Realtime — settings satırı değiştiğinde anında tetiklenir.
  // 2. visibilitychange — kullanıcı başka tab'dan geri döndüğünde yeniler.
  useEffect(() => {
    getDeliverySettings().then(setDeliverySettings);

    // Strateji 1: Realtime
    const channel = supabase
      .channel("settings-delivery-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
        },
        () => {
          getDeliverySettings().then(setDeliverySettings);
        }
      )
      .subscribe();

    // Strateji 2: Tab'a geri dönüldüğünde yenile
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getDeliverySettings().then(setDeliverySettings);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        setCartItems(cartData);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (
    product: Product & { categories?: { name: string } },
    quantity: number = 1
  ): boolean => {
    // Ürün zaten sepette var mı kontrol et
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCartItems(updatedItems);
    } else {
      setCartItems((prevItems) => [
        ...prevItems,
        { id: product.id, product, quantity, category: "", categoryId: 0 },
      ]);
    }

    setToast({ message: "Ürün sepete eklendi.", type: "success" });
    return true;
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0
    );
  };

  const checkout = async () => {
    try {
      // Checkout işlemleri burada yapılabilir
      clearCart();
      setToast({ message: "Satın alma işlemi başarılı.", type: "success" });
      return true;
    } catch {
      setToast({ message: "Satın alma işlemi başarısız.", type: "error" });
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getShippingCost: (deliveryType?: string) => {
          if (deliveryType !== "domestic-cargo") {
            return 0;
          }
          const total = cartItems.reduce(
            (acc, item) => acc + item.quantity * item.product.price,
            0
          );
          return total >= deliverySettings.freeShippingThreshold
            ? 0
            : deliverySettings.domesticCargoFee;
        },
        getFinalTotal: (deliveryType?: string) => {
          const total = cartItems.reduce(
            (acc, item) => acc + item.quantity * item.product.price,
            0
          );
          let shipping = 0;
          if (deliveryType === "domestic-cargo") {
            shipping =
              total >= deliverySettings.freeShippingThreshold
                ? 0
                : deliverySettings.domesticCargoFee;
          }
          return total + shipping;
        },
        isCartOpen,
        setIsCartOpen,
        checkout,
        toast,
        setToast,
        deliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
