"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase, Brand, getBrandImageUrl } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface BrandsSectionProps {
  variant?: "list" | "grid" | "footer";
  title?: string;
}

export default function BrandsSection({
  variant = "grid",
  title,
}: BrandsSectionProps) {
  const t = useTranslations();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setBrands((data || []) as unknown as Brand[]);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    if (variant === "footer") {
      return (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"
            ></div>
          ))}
        </div>
      );
    }
    if (variant === "list") {
      return (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-30 h-16 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      );
    }
    // grid variant
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse w-32">
            <div className="bg-gray-200 rounded-lg p-6 mb-3 h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {t("home.brandsLoading")}
      </div>
    );
  }

  // Footer variant - simple list
  if (variant === "footer") {
    return (
      <ul className="space-y-2">
        {brands.map((brand) => (
          <li key={brand.id} className="text-gray-400 text-sm">
            {brand.name}
          </li>
        ))}
      </ul>
    );
  }

  // List variant - with images and names
  if (variant === "list") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center space-x-3">
            {brand.image ? (
              <div className="w-30 h-16 relative bg-white border border-gray-200 rounded p-2">
                <Image
                  src={getBrandImageUrl(brand.image)}
                  alt={brand.name}
                  fill
                  sizes="120px"
                  className="object-contain p-2.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+";
                  }}
                />
              </div>
            ) : (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
            <span className="text-sm font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Grid variant - grid layout with boxes
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {brands.map((brand) => (
        <div key={brand.id} className="text-center w-32">
          <div className="bg-gray-100 rounded-lg mb-3 h-20 flex items-center justify-center">
            {brand.image ? (
              <div className="relative w-full h-full">
                <Image
                  src={getBrandImageUrl(brand.image)}
                  alt={brand.name}
                  fill
                  sizes="150px"
                  className="object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            ) : null}
            {!brand.image && (
              <span className="font-semibold text-gray-700">{brand.name}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">{brand.name}</p>
        </div>
      ))}
    </div>
  );
}
