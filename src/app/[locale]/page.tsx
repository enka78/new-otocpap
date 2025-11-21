"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandsSection from "@/components/BrandsSection";

export default function HomePage() {
  const t = useTranslations();

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
                <BrandsSection variant="list" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
