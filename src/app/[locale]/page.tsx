"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import { supabase, Brand, getBrandImageUrl } from "@/lib/supabase";

export default function HomePage() {
  const t = useTranslations();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

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
      setBrandsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />

        {/* About Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t("home.experienceTitle")}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t("home.experienceDescription")}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("home.freeInstallationTitle")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("home.freeInstallationDesc")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("home.technicalSupportTitle")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("home.technicalSupportDesc")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {t("home.authorizedBrands")}
                </h3>

                {brandsLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 animate-pulse"
                      >
                        <div className="w-30 h-16 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                ) : brands.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center space-x-3"
                      >
                        {brand.image ? (
                          <div className="w-30 h-16 relative bg-white border border-gray-200 rounded p-2">
                            <Image
                              src={getBrandImageUrl(brand.image)}
                              alt={brand.name}
                              fill
                              sizes="120px"
                              className="object-contain"
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
                        <span className="text-sm font-medium">
                          {brand.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    {t("home.brandsLoading")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
