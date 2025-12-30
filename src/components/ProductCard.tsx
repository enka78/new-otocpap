"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Eye, ShoppingCart } from "lucide-react";
import { Product, getProductImageUrl } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/format";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations();
    const locale = useLocale();
    const { addToCart } = useCart();

    return (
        <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
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
                    {(product as any).brands?.name || t('products.brandLabel')}
                </p>

                {/* Category */}
                <p className="text-sm text-gray-500 mb-3">
                    {(product as any).categories?.name || t('products.categoryLabel')}
                </p>

                {/* Price */}
                <div className="mb-4">
                    <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.price)}
                    </div>
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
                        onClick={() => addToCart(product)}
                        className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
