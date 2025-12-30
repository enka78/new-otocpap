"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, Product, getProductImageUrl } from "@/lib/supabase";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { hasRealContent } from "@/helpers/hasRealContent";
import { formatCurrency } from "@/lib/format";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const productId = params.id;
  const { addToCart, setToast } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
      checkUser();
    }
  }, [productId]);

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

  const fetchProduct = async () => {
    if (!productId) return;

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
        .eq("id", productId)
        .single();

      if (error) throw error;
      setProduct(data as unknown as Product);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ürün Bulunamadı
            </h1>
            <p className="text-gray-600 mb-8">Aradığınız ürün mevcut değil.</p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Ürünlere Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = [product.image1, product.image2, product.image3].filter(
    Boolean
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href={`/${locale}`} className="hover:text-blue-600">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href={`/${locale}/products`} className="hover:text-blue-600">
              Ürünler
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Images, Price, Actions, Details */}
            <div className="space-y-6">
              {/* Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
              </div>

              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-white border border-gray-200 rounded-lg relative">
                  {images[selectedImage] ? (
                    <Image
                      src={getProductImageUrl(images[selectedImage])}
                      alt={product.name}
                      fill
                      sizes="600px"
                      className="object-contain p-6"
                      onError={(e) => {
                        e.preventDefault();
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-700">
                          OTOCPAP
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex space-x-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg border-2 relative bg-white ${selectedImage === index
                            ? "border-blue-600"
                            : "border-gray-200"
                          }`}
                      >
                        {image ? (
                          <Image
                            src={getProductImageUrl(image)}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                            onError={(e) => {
                              e.preventDefault();
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+";
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs font-bold text-gray-700">
                              OTOCPAP
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Fiyat</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => product && addToCart(product)}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {t("products.addToCart")}
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2
                    size={20}
                    onClick={() => {
                      const productUrl = window.location.href;
                      navigator.clipboard.writeText(productUrl);
                      setToast({
                        message: t("products.urlCopied"),
                        type: "success",
                      });
                    }}
                  />
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("products.addToCart")}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("products.category")}
                    </span>
                    <span className="font-medium">
                      {
                        (product as Product & { categories: { name: string } })
                          .categories?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marka:</span>
                    <span className="font-medium">
                      {
                        (product as Product & { brands: { name: string } })
                          .brands?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stok Durumu:</span>
                    <span
                      className={`font-medium ${product.quantity > 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {product.quantity > 0 ? "Stokta Var" : "Stokta Yok"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Description */}
            <div className="space-y-6">
              {product.description && hasRealContent(product.description) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("products.productDescription")}
                  </h2>
                  <div
                    className="prose-content"
                    dangerouslySetInnerHTML={{
                      __html: renderDescription(product.description),
                    }}
                  />
                </div>
              )}
              {product.usage_instructions &&
                hasRealContent(product.usage_instructions) && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Kullanım Talimatları
                    </h3>
                    <div
                      className="prose-content"
                      dangerouslySetInnerHTML={{
                        __html: renderDescription(product.usage_instructions),
                      }}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function renderDescription(text?: string) {
  return text || "";
}
