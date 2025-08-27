"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { supabase, getProductImageUrl } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const t = useTranslations();
  const locale = useLocale();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories(name),
          brands(name)
        `
        )
        .eq("is_featured", true)
        .limit(6);

      if (error) throw error;
      setProducts((data || []) as unknown as Product[]);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("products.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse rounded-lg h-80"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("products.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Öne çıkan CPAP, BiPAP ve solunum cihazlarımızı keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-white border border-gray-200 rounded-t-lg">
                <Image
                  src={getProductImageUrl(product.image1 || "")}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                  onError={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+";
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Brand */}
                <p className="text-sm font-medium text-blue-600 mb-1">
                  {product.brands?.name || "Marka"}
                </p>

                {/* Category */}
                <p className="text-sm text-gray-500 mb-3">
                  {product.categories?.name || "Kategori"}
                </p>

                {/* Price */}
                <div className="mb-4">
                  {user ? (
                    <div className="text-lg font-bold text-blue-600">
                      ₺{product.price.toLocaleString("tr-TR")}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {t("products.priceVisible")}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    href={`/${locale}/products/${product.id}`}
                    className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    {t("products.viewDetails")}
                  </Link>
                  <button
                    onClick={() => addToCart(product as any)}
                    className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Tüm Ürünleri Görüntüle
          </Link>
        </div>
      </div>
    </section>
  );
}
