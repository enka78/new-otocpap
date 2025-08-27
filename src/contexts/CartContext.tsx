"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product, supabase } from "@/lib/supabase";

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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: () => Promise<boolean>;
  toast: ToastMessage | null;
  setToast: (toast: ToastMessage | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Cihaz kategori ID'leri
  const deviceCategoryIds = [1, 3, 5, 7, 8, 9, 10, 11, 13, 14];

  const isDevice = (categoryId: number) => {
    return deviceCategoryIds.includes(categoryId);
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        // Migration: categoryId eksikse product.category_id'den al
        const migratedCart = cartData.map(
          (item: CartItem & { categoryId?: number }) => ({
            ...item,
            categoryId: item.categoryId || item.product.category_id,
          })
        );
        setCartItems(migratedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cartItems]);

  const addToCart = (
    product: Product & { categories?: { name: string } },
    quantity: number = 1
  ): boolean => {
    // Cihaz kontrolü - sepette sadece bir cihaz olabilir
    if (isDevice(product.category_id)) {
      const existingDevice = cartItems.find((item) =>
        isDevice(item.categoryId)
      );
      if (existingDevice && existingDevice.id !== product.id) {
        setToast({
          message:
            "Sepetinizde zaten bir cihaz var. Sepetteki cihazı silip yeni cihaz ekleyebilirsiniz.",
          type: "warning",
        });
        return false;
      }
    }

    // Ürün zaten sepette var mı kontrol et
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      // Cihaz ise quantity artırma
      if (isDevice(product.category_id)) {
        setToast({
          message:
            "Bu cihaz zaten sepetinizde. Cihazlardan sadece bir adet sipariş verebilirsiniz.",
          type: "warning",
        });
        return false;
      }

      // Maske ve aksesuar için quantity artır
      const updatedItems = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCartItems(updatedItems);
    } else {
      let categoryName = "Diğer";
      if (product.categories?.name) {
        categoryName = product.categories.name;
      }

      // Yeni ürün ekle
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity: isDevice(product.category_id) ? 1 : quantity,
        category: categoryName,
        categoryId: product.category_id,
      };

      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);

      // Başarı mesajı
      setToast({
        message: `${product.name} sepete eklendi`,
        type: "success",
      });
    }

    // Sepeti aç
    setTimeout(() => {
      setIsCartOpen(true);
    }, 100);

    return true;
  };

  const removeFromCart = (productId: number) => {
    const updatedItems = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedItems);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Cihazlar için quantity kontrolü - sadece 1 adet
    const item = cartItems.find((item) => item.id === productId);
    if (item && isDevice(item.categoryId) && newQuantity > 1) {
      setToast({
        message: "Cihazlardan sadece bir adet sipariş verebilirsiniz.",
        type: "warning",
      });
      return;
    }

    const updatedItems = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const checkout = async (): Promise<boolean> => {
    try {
      // Kullanıcı giriş yapmış mı kontrol et
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setToast({
          message: "Sipariş vermek için giriş yapmalısınız.",
          type: "warning",
        });
        return false;
      }

      if (cartItems.length === 0) {
        setToast({
          message: "Sepetiniz boş.",
          type: "warning",
        });
        return false;
      }

      // Sepetteki ürünleri orders tablosu için formatla
      const productsData = cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        category: item.category,
      }));

      // Siparişi veritabanına kaydet
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user: user.id,
          products: productsData,
          total: getTotalPrice(),
          currency: "TRY",
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Sipariş kaydedilirken hata:", error);
        setToast({
          message:
            "Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          type: "error",
        });
        return false;
      }

      // Başarılı sipariş
      setToast({
        message: `Siparişiniz başarıyla alındı! Sipariş numaranız: ${data.id}`,
        type: "success",
      });
      clearCart();
      setIsCartOpen(false);
      return true;
    } catch (error) {
      console.error("Checkout hatası:", error);
      setToast({
        message: "Sipariş işlemi sırasında bir hata oluştu.",
        type: "error",
      });
      return false;
    }
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
    checkout,
    toast,
    setToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
